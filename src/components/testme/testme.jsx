import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import worker from "pdfjs-dist/build/pdf.worker.entry";

GlobalWorkerOptions.workerSrc = URL.createObjectURL(new Blob([worker], { type: "application/javascript" }));

const PdfWithGemini = () => {
  const location = useLocation();
  const rawUrl = location.state?.fileUrl;
  const fileUrl = rawUrl?.replace("dl=1", "raw=1");
  const proxyUrl = fileUrl
    ? `http://localhost:5000/api/pdf-proxy?url=${encodeURIComponent(fileUrl)}`
    : null;

  const canvasRef = useRef(null);
  const pdfRef = useRef(null);
  const containerRef = useRef(null);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const [loadingPage, setLoadingPage] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (!proxyUrl) return;
    setLoadingDoc(true);

    (async () => {
      try {
        const resp = await fetch(proxyUrl);
        const buf = await resp.arrayBuffer();
        const loadingTask = getDocument({ data: buf });
        const pdf = await loadingTask.promise;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
      } catch (err) {
        console.error("Error loading PDF:", err);
      } finally {
        setLoadingDoc(false);
      }
    })();
  }, [proxyUrl]);

  useEffect(() => {
    const pdf = pdfRef.current;
    if (!pdf || !containerRef.current) return;
    setLoadingPage(true);

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(pageNumber);
        const canvas = canvasRef.current;
        const container = containerRef.current;

        // Calculate dimensions
        const containerWidth = container.clientWidth - 40;
        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.min((containerWidth / viewport.width) * zoomLevel, 2);
        const scaledViewport = page.getViewport({ scale });

        // Set canvas dimensions
        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        // Render PDF page
        const ctx = canvas.getContext("2d");
        await page.render({
          canvasContext: ctx,
          viewport: scaledViewport
        }).promise;
      } catch (err) {
        console.error("Error rendering page:", err);
      } finally {
        setLoadingPage(false);
      }
    };

    renderPage();
  }, [pageNumber, zoomLevel]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages((m) => [...m, { role: "user", content: input }]);
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/test-me", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, fileUrl, pageNumber }),
      });
      const { reply } = await res.json();
      setMessages((m) => [...m, { role: "gemini", content: reply }]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((m) => [
        ...m,
        { role: "gemini", content: "❌ Failed to get a response." },
      ]);
    } finally {
      setIsLoading(false);
    }
    setInput("");
  };

  if (!fileUrl) {
    return (
      <div className="p-4 text-center text-red-600">
        No PDF URL provided.
      </div>
    );
  }

  return (
    loadingDoc ? 
    <div className="absolute inset-0 flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div> : 

    <div className="flex flex-col md:flex-row bg-gray-50">

      <div className="w-full md:w-2/3 lg:w-1/2 flex flex-col bg-white">

        <div className="flex-1 overflow-auto p-4 relative" ref={containerRef}>
          {loadingDoc ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {loadingPage && (
                <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              )}
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="shadow-lg rounded-lg bg-white max-w-full"
                />
              </div>
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
                  disabled={pageNumber <= 1}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Page {pageNumber} of {numPages}
                </span>
                <button
                  onClick={() => setPageNumber((p) => Math.min(p + 1, numPages))}
                  disabled={pageNumber >= numPages}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>



      <div className="w-full md:w-1/3 lg:w-1/2 flex flex-col border-r border-gray-200 bg-white">


        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-xl p-3 ${msg.role === "user"
                    ? "bg-indigo-600 text-white ml-8"
                    : "bg-gray-100 text-gray-800 mr-8"
                  }`}
              >
                <p className="text-sm">{msg.content}</p>
                <div className={`text-xs mt-1 ${msg.role === "user" ? "text-indigo-100" : "text-gray-500"
                  }`}>
                 
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-xl p-3 max-w-[85%]">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse h-2 w-2 bg-gray-400 rounded-full"></div>
                  <div className="animate-pulse h-2 w-2 bg-gray-400 rounded-full delay-100"></div>
                  <div className="animate-pulse h-2 w-2 bg-gray-400 rounded-full delay-200"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the document..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PdfWithGemini;