import React from 'react'
import api from '../../utils/axios'

async function logOut() {
  try {
    const {data}=await api.get("./api/auth/logout")
    console.log(data)
    
  } catch (error) {
     console.log("Error while logging out",error)
  }
}

export default logOut
