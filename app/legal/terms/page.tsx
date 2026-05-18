"use client";
import React, { useEffect, useState } from "react";
import { Header } from "../../../components/ui/Header";
import { apiClient } from "../../../utils/apiClient";

export default function TermsPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await apiClient.get("get-pages.php?slug=terms");
      if (res.status === "success") {
        setContent(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-bgBase min-h-screen">
      <Header title="Terms & Conditions" showBack />
      <main className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-8 py-12">
        <section className="bg-white p-8 rounded-3xl border border-borderLite shadow-sm space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : content ? (
            <>
              <h1 className="text-3xl font-black text-ink tracking-tight mb-6">
                {content.title}
              </h1>
              <div 
                className="text-inkMid leading-relaxed prose prose-slate max-w-none whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: content.description }}
              />
            </>
          ) : (
            <p className="text-inkMid text-center py-12">Failed to load content.</p>
          )}
        </section>
      </main>
    </div>
  );
}
