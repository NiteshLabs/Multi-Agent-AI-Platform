import { Check, Code2, Copy, Download, Eye, FileText, PanelRightClose, PanelRightOpen, Presentation, X } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { AnimatePresence, easeIn, easeInOut, easeOut, motion } from "motion/react"
import Editor from '@monaco-editor/react';

function Artifact() {
    const [collapsed, setCollapsed] = useState(false)
    const { artifacts, viewerRequest } = useSelector(state => state.message)
    const [tab, setTab] = useState("code")
    const [activeFile, setActiveFile] = useState(0)
    const [copied, setCopied] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    // Document artifacts (PDF / PPT) have a link to the file instead of code.
    const isPdf = artifacts[0]?.type === "pdf"
    const isPpt = artifacts[0]?.type === "ppt"
    const isDoc = isPdf || isPpt
    const artifactId = artifacts[0]?.id

    // A new artifact opens the panel on its natural tab: the document, or the code.
    const [shownId, setShownId] = useState(undefined)
    if (shownId !== artifactId) {
        setShownId(artifactId)
        setTab(isDoc ? "preview" : "code")
        setActiveFile(0)
        setCollapsed(false)
    }

    // A "View" click on a chat message: expand the panel, or open the drawer on mobile.
    const [handledRequest, setHandledRequest] = useState(viewerRequest)
    if (handledRequest !== viewerRequest) {
        setHandledRequest(viewerRequest)
        setCollapsed(false)
        setMobileOpen(true)
    }

    if (artifacts.length === 0) return;


    const file = artifacts[0]?.files?.[activeFile]
    //console.log(file)
    const htmlFile = artifacts[0]?.files?.find(f => f.name === "index.html")
    const cssFile = artifacts[0]?.files?.find(f => f.name === "style.css")
    const jsFile = artifacts[0]?.files?.find(f => f.name === "script.js")
    const canPreview = isDoc ? Boolean(artifacts[0]?.url) : Boolean(htmlFile)
    const HeaderIcon = isPpt ? Presentation : isPdf ? FileText : Code2
    // Browsers render PDFs natively; .pptx needs Microsoft's Office Online viewer,
    // which fetches the file from its (signed) link.
    const docSrc = isPpt
        ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(artifacts[0]?.url || "")}`
        : artifacts[0]?.url
    const previewDoc = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        ${cssFile?.content || ""}
    </style>
</head>
<body>
  ${htmlFile?.content || ""}
<script>
    ${jsFile?.content || ""}
</script>
</body>
</html>
`
    const handleCopy = async () => {
        await navigator.clipboard.writeText(file?.content || "")
        setCopied(true)
        setTimeout(() => {
            setCopied(false)
        }, 2000);
    }

    const detectLanguage = (fileName = "") => {
        const name = fileName.toLocaleLowerCase()

        if (name.endsWith(".html"))
            return "html";

        if (name.endsWith(".css"))
            return "css";

        if (name.endsWith(".js"))
            return "javascript";

        if (name.endsWith(".jsx"))
            return "javascript";

        if (name.endsWith(".ts"))
            return "typescript";

        if (name.endsWith(".tsx"))
            return "typescript";

        if (name.endsWith(".json"))
            return "json";

        if (name.endsWith(".md"))
            return "markdown";

        if (name.endsWith(".py"))
            return "python";
        if (name.endsWith(".java"))
            return "java";

        if (name.endsWith(".cpp"))
            return "cpp";

        if (name.endsWith(".c"))
            return "c";

        return "plaintext";
    }
    const PanelContent = ({onClose}) => {
        return (
            <>
                {!collapsed ?
                    <div className='flex flex-col h-full bg-[#0d0f14]'>
                        <div className='h-14 px-4 border-b border-white/[0.06] flex items-center gap-3 shrink-0'>
                            <button className='flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0'
                                onClick={onClose ?? (() =>  setCollapsed(true))}>
                                {onClose ? <X size={15}/> :<PanelRightClose size={16} />}
                            </button>
                            <div className='flex items-center gap-2 flex-1 min-w-0'>
                                <div className='flex items-center justify-center w-6 h-6 rounded-md bg-indigo-500/10 border border-indigo-500/20 shrink-0'>
                                    <HeaderIcon className='text-indigo-400' size={12} />
                                </div>

                                <div className='text-[13px] font-medium text-slate-200 truncate'>
                                    {artifacts[0]?.title}
                                </div>
                            </div>

                            <div className='flex items-center gap-1 shrink-0'>
                                {isDoc ? (
                                    <a
                                        href={artifacts[0]?.url}
                                        target='_blank'
                                        rel='noopener noreferrer'
                                        title={isPpt ? 'Download PPT' : 'Download PDF'}
                                        className='flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] rounded-lg transition-colors duration-150'
                                    >
                                        <Download size={15} />
                                    </a>
                                ) : (
                                    <button
                                        onClick={handleCopy}
                                        className='flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.05] rounded-lg transition-colors duration-150 bg-transparent border-none cursor-pointer'
                                    >
                                        {copied ? <Check size={15} /> : <Copy size={15} />}
                                    </button>
                                )}
                            </div>

                            {canPreview &&
                                <div className='flex items-center gap-1 bg-white/[0.04] border border-white/[0.06] p-1 rounded-lg'>
                                    <button
                                        onClick={() => setTab("code")}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150 ${tab === "code"
                                            ? "bg-indigo-500 text-white"
                                            : "text-slate-500 hover:text-slate-200"
                                            }`}
                                    >
                                        {isDoc ? <><FileText size={11} /> Content</> : <><Code2 size={11} /> Code</>}
                                    </button>

                                    <button
                                        onClick={() => setTab("preview")}
                                        className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors duration-150 ${tab === "preview"
                                            ? "bg-indigo-500 text-white"
                                            : "text-slate-500 hover:text-slate-200"
                                            }`}>
                                        <Eye size={11} /> Preview
                                    </button>
                                </div>}


                        </div>
                        {tab === "code" && !isDoc &&
                            <div className='flex h-auto border-b border-white/[0.06] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0'>
                                {
                                    artifacts[0]?.files?.map((f, index) => (
                                        <button
                                            onClick={() => setActiveFile(index)}
                                            className={`px-4 py-2.5 text-[11px] font-medium whitespace-nowrap transition-colors duration-150 border-r border-white/[0.05] relative cursor-pointer bg-transparent ${activeFile === index
                                                ? "text-indigo-400"
                                                : "text-slate-500 hover:text-slate-300"
                                                }`}
                                        >
                                            {f?.name}

                                            {activeFile === index && (
                                                <div className='absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500 rounded-t-full' />
                                            )}
                                        </button>
                                    ))
                                }
                            </div>
                        }

                        <div className='flex-1 overflow-hidden'>
                            {(tab === "preview" && canPreview) ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className='w-full h-full  '
                                >
                                    {isDoc ? (
                                        // No sandbox: it would block the browser's PDF viewer
                                        // and the Office viewer's scripts
                                        <iframe
                                            key={docSrc}
                                            title={isPpt ? 'ppt-preview' : 'pdf-preview'}
                                            src={docSrc}
                                            className='w-full h-full bg-white'
                                        />
                                    ) : (
                                        <iframe
                                            title='preview'
                                            srcDoc={previewDoc}
                                            sandbox='allow-scripts'
                                            className='w-full h-full  bg-white'
                                        />
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className='w-full h-full  '
                                >
                                    <Editor
                                        theme='vs-dark'
                                        language={detectLanguage(file?.name)}
                                        value={file?.content}
                                        options={{
                                            readOnly: true,
                                            minimap: { enabled: false },
                                            fontSize: 13,
                                            wordWrap: "on",
                                            automaticLayout: true,
                                            scrollBeyondLastLine: false,
                                            padding: { top: 16 },
                                            lineNumbers: "on",
                                            renderLineHighlight: "none"
                                        }}
                                    />
                                </motion.div>
                            )}
                        </div>

                    </div> :
                    <div className='hidden lg:flex h-full border-l border-white/[0.06] bg-[#0d0f14] flex-col items-center py-4 gap-3 shrink-0'>
                        <button
                            className='flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer shrink-0'
                            onClick={() => setCollapsed(false)}
                        >
                            <PanelRightOpen size={16} />
                        </button>

                        <div className='flex items-center gap-2 flex-1 min-w-0'>
                            <div
                                className='text-[10px] font-medium text-slate-600 tracking-widest uppercase whitespace-nowrap'
                                style={{
                                    writingMode: "vertical-lr",
                                    //transform: "rotate(180deg)"
                                }}
                            >
                                {artifacts[0]?.title}
                            </div>
                        </div>
                    </div>
                }
            </>
        )
    }
    return (
        <>
            <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed bottom-24 right-4 z-40 flex items-center gap-2 px-3.5 py-2
    rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-medium shadow-lg
    shadow-indigo-500/20 border-none cursor-pointer transition-colors duration-150"
            >
                <HeaderIcon size={13} />
                {isPpt ? "View Slides" : isPdf ? "View PDF" : "View Code"}
            </button>
            <AnimatePresence>
                {mobileOpen && <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={() => setMobileOpen(false)}
                        className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="lg:hidden fixed inset-y-0 right-0 z-50 w-[88vw] max-w-[420px] border-l border-white/[0.06] overflow-hidden"
                    >
                        <PanelContent onClose={()=>setMobileOpen(false)}/>
                    </motion.div>
                </>}
            </AnimatePresence>
            <motion.div
                initial={{ width: 350 }}
                animate={{ width: collapsed ? 48 : 350 }}
                transition={{
                    duration: 0.25,
                    ease: easeInOut
                }}
                className='hidden lg:flex h-full border-l border-white/[0.06] flex-col overflow-hidden shrink-0 w-[250px]'>



                <PanelContent />
            </motion.div>
        </>
    )
}

export default Artifact
