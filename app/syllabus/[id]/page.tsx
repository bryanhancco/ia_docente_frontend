'use client';

import { useRouter, useParams } from 'next/navigation';

export default function SyllabusDetailPage() {
  const router = useRouter();
  const params = useParams();
  const syllabusId = params.id;

  // Mock data based on syllabus ID
  const syllabusData = {
    1: {
      courseName: 'Advanced Mathematics',
      numberOfWeeks: '16',
      expectedOutcomes: 'Students will understand advanced mathematical concepts including calculus, linear algebra, and statistical analysis.',
      themes: [
        {
          theme: 'Calculus Fundamentals',
          description: 'Derivatives, integrals, and their applications.',
          weeks: '1-4'
        },
        {
          theme: 'Linear Algebra',
          description: 'Matrices, vectors, and linear transformations.',
          weeks: '5-8'
        },
        {
          theme: 'Statistical Analysis',
          description: 'Probability, distributions, and hypothesis testing.',
          weeks: '9-12'
        },
        {
          theme: 'Applied Mathematics',
          description: 'Real-world applications and problem-solving.',
          weeks: '13-16'
        }
      ]
    },
    'new-syllabus': {
      courseName: 'Nuevo Sílabo Generado',
      numberOfWeeks: '12',
      expectedOutcomes: 'Resultados de aprendizaje generados automáticamente por IA según los datos proporcionados.',
      themes: [
        {
          theme: 'Introducción',
          description: 'Conceptos fundamentales del curso.',
          weeks: '1-3'
        },
        {
          theme: 'Desarrollo',
          description: 'Profundización en temas principales.',
          weeks: '4-8'
        },
        {
          theme: 'Aplicación',
          description: 'Casos prácticos y ejercicios.',
          weeks: '9-12'
        }
      ]
    }
  };

  const currentSyllabus = syllabusData[syllabusId as keyof typeof syllabusData] || syllabusData[1];

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
              <button className="text-[#0d141c] text-sm font-medium leading-normal">Explore</button>
              <button className="text-[#0d141c] text-sm font-medium leading-normal">Resources</button>
            </div>
            <button
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#e7edf4] text-[#0d141c] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
            >
              <div className="text-[#0d141c]">
                <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"/>
                </svg>
              </div>
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAmA3Fp02pB3ZeBzR1SRC-JsLGcFtHXYCsgzzquy2XqUVeWa3UsodueKhOaZadZxZ_GiOZbjbfLDy5kM1D3JqPoRVIx4l9JMIiQpDUCabfPM5hWVER_JIAfpz8SG8S2YMe-khjacYgGTR7L2FTKfCOsV0Q-7_IhEJg9zKBc14rcVHi3FZQr7V_7byazEH3A1NDRZEwVjEAi2GH4bT86ImRmPPLjvOryfJajWwWzWoX6buaE29ir41W51HcAH9GhWwc_gyIFrmNxMQ")'}}
            ></div>
          </div>
        </header>
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#0d141c] tracking-light text-[32px] font-bold leading-tight">Syllabus Details</p>
                <p className="text-[#49739c] text-sm font-normal leading-normal">View and manage the details of your syllabus.</p>
              </div>
            </div>
            
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Course Name</p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] h-14 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal"
                  value={currentSyllabus.courseName}
                  readOnly
                />
              </label>
            </div>
            
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Number of Weeks</p>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] h-14 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal"
                  value={currentSyllabus.numberOfWeeks}
                  readOnly
                />
              </label>
            </div>
            
            <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3">
              <label className="flex flex-col min-w-40 flex-1">
                <p className="text-[#0d141c] text-base font-medium leading-normal pb-2">Expected Learning Outcomes</p>
                <textarea
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#0d141c] focus:outline-0 focus:ring-0 border border-[#cedbe8] bg-slate-50 focus:border-[#cedbe8] min-h-36 placeholder:text-[#49739c] p-[15px] text-base font-normal leading-normal"
                  value={currentSyllabus.expectedOutcomes}
                  readOnly
                />
              </label>
            </div>
            
            <h2 className="text-[#0d141c] text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Thematic Axes</h2>
            <div className="px-4 py-3">
              <div className="flex overflow-hidden rounded-lg border border-[#cedbe8] bg-slate-50">
                <table className="flex-1">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left text-[#0d141c] w-[400px] text-sm font-medium leading-normal">Theme</th>
                      <th className="px-4 py-3 text-left text-[#0d141c] w-[400px] text-sm font-medium leading-normal">Description</th>
                      <th className="px-4 py-3 text-left text-[#0d141c] w-[400px] text-sm font-medium leading-normal">Weeks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSyllabus.themes.map((themeItem, index) => (
                      <tr key={index} className="border-t border-t-[#cedbe8]">
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#0d141c] text-sm font-normal leading-normal">
                          {themeItem.theme}
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#49739c] text-sm font-normal leading-normal">
                          {themeItem.description}
                        </td>
                        <td className="h-[72px] px-4 py-2 w-[400px] text-[#49739c] text-sm font-normal leading-normal">
                          {themeItem.weeks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
