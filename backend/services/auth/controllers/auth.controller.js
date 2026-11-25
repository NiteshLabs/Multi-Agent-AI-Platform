import { getAuth } from "firebase-admin/auth"
import { app } from "../config/firebase.js"
import crypto from "node:crypto";
import User from "../models/user_model.js";
import redis from "../../../shared/redis/redis.js";

// Copies the user's latest DB values into their live session (what /api/me returns).
// "user-session-<id>" holds {"sessionId": "<uuid>"}, so it must be parsed, not used raw.
const refreshSession = async (user) => {
    const pointer = await redis.get(`user-session-${user._id}`)
    if (!pointer) return

    let sessionId
    try {
        sessionId = JSON.parse(pointer).sessionId
    } catch {
        return
    }
    if (!sessionId) return

    // XX: only update a session that still exists; KEEPTTL: don't extend its expiry.
    await redis.set(`session-${sessionId}`, JSON.stringify({
        userId: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        plan: user.plan,
        credits: user.credits,
        totalCredits: user.totalCredits,
        planExpiresAt: user.planExpiresAt
    }), "KEEPTTL", "XX")
}

export const login = async (req, res) => {
    try {
        const { token } = req.body
        const decoded = await getAuth(app).verifyIdToken(token)
        let user = await User.findOne({
            firebaseUid: decoded.uid
        })

        if (!user) {
            user = await User.create({
                firebaseUid: decoded.uid,
                name: decoded.name,
                email: decoded.email,
                avatar: decoded.picture
            })
        }

        const sessionId = crypto.randomUUID()
        await redis.set(`user-session-${user?._id}`, JSON.stringify({
            sessionId: sessionId
        }))
        await redis.set(`session-${sessionId}`, JSON.stringify({
            userId: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            plan: user.plan,
            credits: user.credits,
            totalCredits: user.totalCredits,
            planExpiresAt: user.planExpiresAt
        }), "EX", 7 * 24 * 60 * 60);

        res.cookie("session", sessionId, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        return res.status(200).json(user)



    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            message: error.message,
            stack: error.stack
        });
    }
}

export const logOut = async (req, res) => {
    try {
        // remove cookies from redis 
        const sessionId = req.cookie?.session
        await redis.del(`session-${sessionId}`)

        // remove cookies from cookie
        res.clearCookie("session")

        return res.status(200).json({ message: "logout successfully" })
    } catch (error) {
        console.error("LOGOUT ERROR from auth.controller.js:", error);

        return res.status(500).json({
            message: error.message,
            stack: error.stack
        });

    }
}

export const updateUserPayment = async (req, res) => {
    try {
        const { plan, credits, userId } = req.body
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        user.plan = plan
        user.credits += credits
        user.totalCredits += credits
        user.planExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        await user.save()

        await refreshSession(user)

        return res.status(200).json({ success: true })

    } catch (error) {
        return res.status(500).json({ message: `update user payment error in auth.controller.js ${error}` })
    }
}

export const deductCredits = async (req, res) => {
    try {
        const { userId, agent } = req.body
        const COST = {
            chat: 1,
            search: 5,
            coding: 10,
            ppt: 10,
            vision: 10
        };

        const user = await User.findById(userId)

        if (!user) {
            return res.status(400).json({ message: "user not found in auth.controller.js" })
        }

        const requiredCredits = COST[agent] || 1

        if (user.credits < requiredCredits) {
            return res.status(400).json({ message: "Not enough credits." })
        }

        user.credits -= requiredCredits
        await user.save()

        await refreshSession(user)

        return res.status(200).json({ success: true , credits : user.credits})
    } catch (error) {
        return res.status(500).json({ message: `Deduct Credits error in auth.controller.js ${error}` })
    }
}