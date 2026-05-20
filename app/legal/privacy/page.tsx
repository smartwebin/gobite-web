"use client";
import React, { useEffect, useState } from "react";
import { Header } from "../../../components/ui/Header";
import { apiClient } from "../../../utils/apiClient";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await apiClient.get("get-pages.php?slug=privacy");
      if (res.status === "success") {
        setContent(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getDomainRoot = () => {
    const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/Zen/gobite/api";
    return apiURL.replace("/api", "/");
  };

  const domain = getDomainRoot();

  return (
    <div className="flex-1 flex flex-col bg-bgBase min-h-screen">
      <Header title="Privacy Policy" showBack />
      <main className="flex-1 p-4 md:p-8 max-w-3xl mx-auto w-full space-y-6 py-8">
        <section className="bg-white p-6 md:p-8 rounded-3xl border border-borderLite shadow-sm space-y-6">
          <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-borderLite">
            <div className="w-16 h-16 rounded-full bg-accentLight flex items-center justify-center text-primary shadow-inner">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-3xl font-black text-ink tracking-tight">
              {content?.title || "Privacy Policy"}
            </h1>
            {content?.created_date && (
              <span className="text-xs text-inkLight font-semibold">
                Last updated: {content.created_date}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : content ? (
            <>
              {content.image_url && (
                <div className="relative w-full h-56 md:h-72 rounded-2xl overflow-hidden shadow-sm">
                  <Image 
                    src={content.image_url.startsWith("http") ? content.image_url : `${domain}${content.image_url}`} 
                    alt={content.title || "Privacy"} 
                    fill 
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}
              
              <div 
                className="text-inkMid leading-relaxed prose prose-orange max-w-none text-sm md:text-base"
                dangerouslySetInnerHTML={{ __html: content.description }}
              />

              {content.sub_images && content.sub_images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-borderLite">
                  {content.sub_images.map((img: any) => (
                    <div key={img.id} className="relative w-full h-32 md:h-40 rounded-xl overflow-hidden shadow-sm bg-gray-50">
                      <Image 
                        src={img.image_url.startsWith("http") ? img.image_url : `${domain}${img.image_url}`} 
                        alt="Restaurant Detail" 
                        fill 
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="text-inkMid text-center py-12">Failed to load content.</p>
          )}

          <div className="pt-6 border-t border-borderLite text-center">
            <span className="text-xs text-inkLight">
              © {new Date().getFullYear()} Gobite. All rights reserved.
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
