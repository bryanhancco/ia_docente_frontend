'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateSyllabusPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    courseName: '',
    numberOfWeeks: '',
    expectedOutcomes: '',
    thematicAxes: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    // Mock generation process
    setTimeout(() => {
      setIsGenerating(false);
      // Redirect to syllabus detail page
      router.push('/syllabus/new-syllabus');
    }, 3000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isGenerating) {
    return (
      <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
        <div className="layout-container flex h-full grow flex-col">
          <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
            <div className="flex items-center gap-4 text-[#0d141c]">
              <div className="size-4">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_6_330)">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                      fill="currentColor"
                    ></path>
                  </g>
                  <defs>
                    <clipPath id="clip0_6_330"><rect width="48" height="48" fill="white"></rect></clipPath>
                  </defs>
                </svg>
              </div>
              <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">DocentePlus AI</h2>
            </div>
          </header>
          <div className="px-40 flex flex-1 justify-center py-5 items-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0d80f2] mx-auto mb-8"></div>
              <h2 className="text-[#0d141c] text-[28px] font-bold leading-tight mb-4">Generando sílabo</h2>
              <p className="text-[#49739c] text-base">Por favor espera mientras creamos tu sílabo personalizado...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-slate-50 group/design-root overflow-x-hidden" style={{fontFamily: 'Inter, "Noto Sans", sans-serif'}}>
      <div className="layout-container flex h-full grow flex-col">
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e7edf4] px-10 py-3">
          <div className="flex items-center gap-4 text-[#0d141c]">
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_6_330)">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                    fill="currentColor"
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0_6_330"><rect width="48" height="48" fill="white"></rect></clipPath>
                </defs>
              </svg>
            </div>
            <h2 className="text-[#0d141c] text-lg font-bold leading-tight tracking-[-0.015em]">DocentePlus AI</h2>
          </div>
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              <button 
                className="text-[#0d141c] text-sm font-medium leading-normal"
                onClick={() => router.push('/dashboard')}
              >
                My Classes
              </button>
              <button 
                className="text-[#0d80f2] text-sm font-medium leading-normal"
                onClick={() => router.push('/dashboard')}
              >
                Syllabus
              </button>
              <button className="text-[#0d141c] text-sm font-medium leading-normal">Resources</button>
              <button className="text-[#0d141c] text-sm font-medium leading-normal">Community</button>
            </div>
            <button
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#e7edf4] text-[#0d141c] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
            >
              <div className="text-[#0d141c]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/>
                </svg>
              </div>
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBhA2R4A5oV7GQIV1l5zPSuwKxgB6FzhkAyD8KxnDS8EWEwtyHztVMIdlgYjUR7YHoYRj3PiTaRbMbYJ_zcDDOpC1nRueqtALFInytKPJdF5oYfXpavJuYNIxi6tkZQY8F6NgPaYRm_LyTtvE-SqaqExJGzs_ugbl-dRbHn0bTxGJ5bya23ysq4BZTn8ROoblWTdSscFXeFpGeGcP8LTkZAHLSpp1WpsIbJeFFT-g0RZtVkPOR64a7LYN5cbQoNns_pp0bt7mK7Ig")'}}
            ></div>
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight min-w-72">Create Syllabus</p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Course Name</p>
                  <input
                    name="courseName"
                    placeholder="e.g., Introduction to Programming"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-[#e7edf4] focus:border-none h-14 placeholder:text-[#49739c] p-4 text-base font-normal leading-normal"
                    value={formData.courseName}
                    onChange={handleInputChange}
                    required
                  />
                </label>
              </div>
              
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Number of Weeks</p>
                  <input
                    name="numberOfWeeks"
                    placeholder="e.g., 15"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-[#e7edf4] focus:border-none h-14 placeholder:text-[#49739c] p-4 text-base font-normal leading-normal"
                    value={formData.numberOfWeeks}
                    onChange={handleInputChange}
                    type="number"
                    min="1"
                    max="52"
                    required
                  />
                </label>
              </div>
              
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Expected Outcomes</p>
                  <textarea
                    name="expectedOutcomes"
                    placeholder="Describe the learning outcomes for this course"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-[#e7edf4] focus:border-none min-h-36 placeholder:text-[#49739c] p-4 text-base font-normal leading-normal"
                    value={formData.expectedOutcomes}
                    onChange={handleInputChange}
                    required
                  />
                </label>
              </div>
              
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
                <label className="flex flex-col min-w-40 flex-1">
                  <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Thematic Axes</p>
                  <textarea
                    name="thematicAxes"
                    placeholder="List the main thematic axes of the course"
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border-none bg-[#e7edf4] focus:border-none min-h-36 placeholder:text-[#49739c] p-4 text-base font-normal leading-normal"
                    value={formData.thematicAxes}
                    onChange={handleInputChange}
                    required
                  />
                </label>
              </div>
              
              <div className="flex px-4 py-3 justify-end">
                <button
                  type="submit"
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#0d80f2] text-slate-50 text-sm font-bold leading-normal tracking-[0.015em]"
                >
                  <span className="truncate">Create Syllabus</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
