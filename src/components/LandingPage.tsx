"use client";

import { useState, useEffect } from "react";

interface LandingPageProps {
  onGenerate: (query: string) => void;
  isLoading: boolean;
}

export default function LandingPage({ onGenerate, isLoading }: LandingPageProps) {
  const [query, setQuery] = useState("");
  const [typingText, setTypingText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const typingWords = [
    "Real-time news mind mapping",
    "Citation-backed insights",
    "Interactive data visualization",
    "AI-powered analysis",
    "Dynamic knowledge graphs"
  ];

  // Typing effect
  useEffect(() => {
    const currentWord = typingWords[currentWordIndex];
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (typingText.length < currentWord.length) {
          setTypingText(currentWord.slice(0, typingText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2000); // Pause before deleting
        }
      } else {
        if (typingText.length > 0) {
          setTypingText(typingText.slice(0, -1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % typingWords.length);
        }
      }
    }, isDeleting ? 50 : 100); // Faster deleting, slower typing

    return () => clearTimeout(timeout);
  }, [typingText, currentWordIndex, isDeleting, typingWords]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onGenerate(query.trim());
    }
  };

  return (
    <div style={{ 
      background: 'linear-gradient(to bottom right, #eff6ff, #ffffff, #eef2ff)',
      minHeight: '100vh'
    }}>

      {/* Main Content - Centered on screen */}
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        paddingTop: '2rem', 
        paddingBottom: '2rem',
        paddingLeft: '15%', 
        paddingRight: '15%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Scrolling News Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          opacity: 0.2
        }}>
          {/* Row 1 */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: 0,
            width: '100%',
            display: 'flex',
            animation: 'scrollNewsSeamless 60s linear infinite',
            alignItems: 'center'
          }}>
            {[
              // Trump / US politics (PD – US Gov)
              "https://upload.wikimedia.org/wikipedia/commons/8/8e/President_Donald_Trump_meets_with_freed_Israeli_hostages_%2854778890430%29.jpg",
              "https://upload.wikimedia.org/wikipedia/commons/5/52/President-Donald-Trump-Official-Presidential-Portrait.png",

              // Ukraine war (Sept 2025 events) – CC BY 4.0
              "https://upload.wikimedia.org/wikipedia/commons/b/bc/Disposal_of_an_air-dropped_bomb_in_Kherson%2C_2025-09-16_%2801%29.jpg",
              "https://upload.wikimedia.org/wikipedia/commons/2/2c/Institute_for_Advanced_Training_of_Pharmacy_Specialists_in_Kharkiv_after_Russian_attack%2C_2025-09-16_%2801%29.jpg",

              // Gaza war (2023–2025) – CC BY-SA (see each file page for exact license)
              "https://upload.wikimedia.org/wikipedia/commons/4/42/Images_of_war_23-25_from_Gaza%2C_by_Jaber_Badwen%2C_IMG_5886.jpg",
              "https://upload.wikimedia.org/wikipedia/commons/3/3b/Palestinian_Red_Crescent_Personnel_inspect_a_destroyed_ambulance_in_Deir_el-Balah_%2C_Gaza_Strip.jpg",

              // Duplicate the images for seamless scrolling
              "https://upload.wikimedia.org/wikipedia/commons/8/8e/President_Donald_Trump_meets_with_freed_Israeli_hostages_%2854778890430%29.jpg",
              "https://upload.wikimedia.org/wikipedia/commons/5/52/President-Donald-Trump-Official-Presidential-Portrait.png",
              "https://upload.wikimedia.org/wikipedia/commons/b/bc/Disposal_of_an_air-dropped_bomb_in_Kherson%2C_2025-09-16_%2801%29.jpg",
              "https://upload.wikimedia.org/wikipedia/commons/2/2c/Institute_for_Advanced_Training_of_Pharmacy_Specialists_in_Kharkiv_after_Russian_attack%2C_2025-09-16_%2801%29.jpg",
              "https://upload.wikimedia.org/wikipedia/commons/4/42/Images_of_war_23-25_from_Gaza%2C_by_Jaber_Badwen%2C_IMG_5886.jpg",
              "https://upload.wikimedia.org/wikipedia/commons/3/3b/Palestinian_Red_Crescent_Personnel_inspect_a_destroyed_ambulance_in_Deir_el-Balah_%2C_Gaza_Strip.jpg"
            ].map((src, index) => (
              <div
                key={`row1-${index}`}
                style={{
                  minWidth: '300px',
                  height: '200px',
                  marginRight: '2rem',
                  borderRadius: '0.5rem',
                  backgroundImage: `url(${src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'grayscale(20%) blur(0.5px)',
                  opacity: 0.6
                }}
              />
            ))}
          </div>

          {/* Row 2 */}
          <div style={{
            position: 'absolute',
            top: '40%',
            left: 0,
            width: '100%',
            display: 'flex',
            animation: 'scrollNewsSeamless 60s linear infinite reverse',
            alignItems: 'center'
          }}>
            {[
              // UNGA 80 (NYC, Sept 22, 2025) – US & India
              "https://commons.wikimedia.org/wiki/Special:FilePath/80th%20Session%20of%20the%20United%20Nations%20General%20Assembly%20in%20New%20York%20City%20from%20September%2022-26%2C%202025%20-%202.jpg",

              // Ukraine x IAEA (Sept 15, 2025)
              "https://commons.wikimedia.org/wiki/Special:FilePath/Svitlana%20Hrynchuk%20or%20Grynchuk%20meeting%20IAEA%27s%20Rafael%20Mariano%20Grossi%202025%2009.jpg",

              // Ukraine – Hrushivka strike aftermath (Sept 11, 2025)
              "https://commons.wikimedia.org/wiki/Special:FilePath/Destructions%20in%20Hrushivka%20after%20Russian%20attack%2C%202025-09-11%20%2804%29.jpg",

              // Sudan crisis – refugees in Chad (Jan 24, 2025)
              "https://commons.wikimedia.org/wiki/Special:FilePath/Foreign%20Secretary%20David%20Lammy%20meets%20Sudanese%20refugees%20in%20Chad%20in%20the%20border%20town%20of%20Adre%20on%2024%20January%202025%20-%2013.jpg",

              // South Korea wildfires from space (Mar 22, 2025)
              "https://commons.wikimedia.org/wiki/Special:FilePath/Southkoreafires%20amo%2020250322%20lrg.jpg",

              // Europe heat/land conditions (Copernicus – Sept 4, 2025)
              "https://commons.wikimedia.org/wiki/Special:FilePath/Lake%20Tisza%2C%20Hungary%20%28Copernicus%202025-09-04%29.png",

              // Duplicate the images for seamless scrolling
              "https://commons.wikimedia.org/wiki/Special:FilePath/80th%20Session%20of%20the%20United%20Nations%20General%20Assembly%20in%20New%20York%20City%20from%20September%2022-26%2C%202025%20-%202.jpg",
              "https://commons.wikimedia.org/wiki/Special:FilePath/Svitlana%20Hrynchuk%20or%20Grynchuk%20meeting%20IAEA%27s%20Rafael%20Mariano%20Grossi%202025%2009.jpg",
              "https://commons.wikimedia.org/wiki/Special:FilePath/Destructions%20in%20Hrushivka%20after%20Russian%20attack%2C%202025-09-11%20%2804%29.jpg",
              "https://commons.wikimedia.org/wiki/Special:FilePath/Foreign%20Secretary%20David%20Lammy%20meets%20Sudanese%20refugees%20in%20Chad%20in%20the%20border%20town%20of%20Adre%20on%2024%20January%202025%20-%2013.jpg",
              "https://commons.wikimedia.org/wiki/Special:FilePath/Southkoreafires%20amo%2020250322%20lrg.jpg",
              "https://commons.wikimedia.org/wiki/Special:FilePath/Lake%20Tisza%2C%20Hungary%20%28Copernicus%202025-09-04%29.png"
            ].map((src, index) => (
              <div
                key={`row2-${index}`}
                style={{
                  minWidth: '300px',
                  height: '200px',
                  marginRight: '2rem',
                  borderRadius: '0.5rem',
                  backgroundImage: `url(${src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'grayscale(20%) blur(0.5px)',
                  opacity: 0.6
                }}
              />
            ))}
          </div>

          {/* Row 3 */}
          <div style={{
            position: 'absolute',
            top: '70%',
            left: 0,
            width: '100%',
            display: 'flex',
            animation: 'scrollNewsSeamless 60s linear infinite',
            alignItems: 'center'
          }}>
            {[
              // Super Typhoon Ragasa (Sep 23, 2025)
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154824/typhoonragasa_tmo_20250923_lrg.jpg",
              // Total lunar eclipse (ISS photo) (Sep 7, 2025)
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154814/ISS073-E-611649_lrg.jpg",
              // Alaska fall colors from space (Sep 18, 2025)
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154821/alaskafall_oli_20250918_lrg.jpg",
              // Heatwave map – Western North America (Sep 3, 2025)
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154754/pnwheatwave_geos5_20250903_lrg.jpg",
              // Arctic sea ice minimum map (Sep 10, 2025)
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154807/arctic_nsidc_20250910_lrg.jpg",
              // Wildfire smoke over WA/BC (Sep 13, 2025)
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154797/pnwsmoke_tmo_20250913_lrg.jpg",
              // Greenland Ice Sheet – late-Aug (Aug 21, 2025)
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154793/greenlandmelt_oli2_20250821_lrg.jpg",
              // Greenland Ice Sheet – early-Sep (Sep 6, 2025)
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154793/greenlandmelt_oli2_20250906_lrg.jpg",
              // DRC forest loss (Kisangani) – regional view (2001–2024)
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154817/congo_oli_2024_lrg.jpg",
              // DRC forest loss (Kisangani) – zoomed view (2001–2024)
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154817/congozm_oli_2024_lrg.jpg",
              // Duplicated for seamless loop
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154824/typhoonragasa_tmo_20250923_lrg.jpg",
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154814/ISS073-E-611649_lrg.jpg",
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154821/alaskafall_oli_20250918_lrg.jpg",
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154754/pnwheatwave_geos5_20250903_lrg.jpg",
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154807/arctic_nsidc_20250910_lrg.jpg",
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154797/pnwsmoke_tmo_20250913_lrg.jpg",
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154793/greenlandmelt_oli2_20250821_lrg.jpg",
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154793/greenlandmelt_oli2_20250906_lrg.jpg",
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154817/congo_oli_2024_lrg.jpg",
              "https://eoimages.gsfc.nasa.gov/images/imagerecords/154000/154817/congozm_oli_2024_lrg.jpg"
            ].map((src, index) => (
              <div
                key={`row3-${index}`}
                style={{
                  minWidth: '300px',
                  height: '200px',
                  marginRight: '2rem',
                  borderRadius: '0.5rem',
                  backgroundImage: `url(${src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'grayscale(20%) blur(0.5px)',
                  opacity: 0.6
                }}
              />
            ))}
          </div>
        </div>

        <div style={{ 
          width: '100%', 
          maxWidth: '42rem',
          position: 'relative',
          zIndex: 2
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderRadius: '1.5rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            padding: 'clamp(2rem, 4vw, 3rem)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1 style={{ 
                fontSize: 'clamp(3rem, 8vw, 4rem)', 
                fontWeight: 'bold', 
                fontFamily: '"Space Grotesk", "Inter", system-ui, -apple-system, sans-serif',
                background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981, #6366f1, #3b82f6)',
                backgroundSize: '300% 300%',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradientFlow 10s ease-in-out infinite',
                marginBottom: '1.5rem',
                margin: '0 0 1.5rem 0',
                letterSpacing: '-0.02em'
              }}>Mapress</h1>
              <div style={{ 
                color: '#6b7280', 
                fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', 
                marginBottom: '2rem',
                margin: '0 0 2rem 0',
                minHeight: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span>{typingText}</span>
                <span style={{
                  display: 'inline-block',
                  width: '2px',
                  height: '1.2em',
                  backgroundColor: '#3b82f6',
                  marginLeft: '2px',
                  animation: 'blink 1s infinite'
                }}></span>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ marginTop: '24px' }}>
              <div style={{ position: 'relative' }}>
                <input
                  id="query"
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask about any news topic..."
                  style={{
                    width: '100%',
                    paddingLeft: 'clamp(1rem, 4vw, 2rem)',
                    paddingRight: 'clamp(3rem, 8vw, 4rem)',
                    paddingTop: 'clamp(0.75rem, 2vw, 1.25rem)',
                    paddingBottom: 'clamp(0.75rem, 2vw, 1.25rem)',
                    border: '1px solid #d1d5db',
                    borderRadius: 'clamp(1rem, 3vw, 1.5rem)',
                    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                    color: '#111827',
                    backgroundColor: 'white',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    maxWidth: '100%',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  }}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading || !query.trim()}
                  style={{
                    position: 'absolute',
                    right: 'clamp(0.75rem, 2vw, 1rem)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 'clamp(2rem, 5vw, 2.5rem)',
                    height: 'clamp(2rem, 5vw, 2.5rem)',
                    borderRadius: '50%',
                    backgroundColor: isLoading || !query.trim() ? '#d1d5db' : '#1f2937',
                    border: 'none',
                    cursor: isLoading || !query.trim() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading && query.trim()) {
                      e.currentTarget.style.backgroundColor = '#374151';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading && query.trim()) {
                      e.currentTarget.style.backgroundColor = '#1f2937';
                    }
                  }}
                >
                  {isLoading ? (
                    <svg 
                      style={{ 
                        width: 'clamp(1rem, 3vw, 1.25rem)', 
                        height: 'clamp(1rem, 3vw, 1.25rem)', 
                        color: 'white',
                        animation: 'spin 1s linear infinite'
                      }} 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        style={{ opacity: 0.25 }} 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        style={{ opacity: 0.75 }} 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg 
                      style={{ width: 'clamp(1rem, 3vw, 1.25rem)', height: 'clamp(1rem, 3vw, 1.25rem)', color: 'white' }} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" 
                      />
                    </svg>
                  )}
                </button>
              </div>
            </form>

            {/* Examples */}
            <div style={{ marginTop: '3rem', paddingTop: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '0.75rem', 
                justifyContent: 'center' 
              }}>
                {[
                  "AI developments this week",
                  "Climate policy updates", 
                  "Tech industry news",
                  "Economic indicators",
                  "International relations"
                ].map((example) => (
                  <button
                    key={example}
                    onClick={() => setQuery(example)}
                    style={{
                      padding: 'clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2.5vw, 1.5rem)',
                      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      borderRadius: 'clamp(1rem, 3vw, 1.5rem)',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      fontWeight: '500',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    disabled={isLoading}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section - Right below main screen */}
      <div style={{ 
        padding: '4rem 15%',
        backgroundColor: '#f8fafc'
      }}>
        <div style={{ maxWidth: '56rem', width: '100%', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '2rem' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                backgroundColor: '#dbeafe', 
                borderRadius: '0.75rem', 
                margin: '0 auto 0.75rem auto', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '40px', 
                height: '40px' 
              }}>
                <svg style={{ width: '20px', height: '20px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 style={{ fontWeight: '500', color: '#111827', margin: '0 0 0.25rem 0' }}>Real-time Data</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>Latest news from multiple sources</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                backgroundColor: '#dcfce7', 
                borderRadius: '0.75rem', 
                margin: '0 auto 0.75rem auto', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '40px', 
                height: '40px' 
              }}>
                <svg style={{ width: '20px', height: '20px', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 style={{ fontWeight: '500', color: '#111827', margin: '0 0 0.25rem 0' }}>Citation-backed</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>Every fact linked to sources</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                backgroundColor: '#f3e8ff', 
                borderRadius: '0.75rem', 
                margin: '0 auto 0.75rem auto', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '40px', 
                height: '40px' 
              }}>
                <svg style={{ width: '20px', height: '20px', color: '#9333ea' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <h3 style={{ fontWeight: '500', color: '#111827', margin: '0 0 0.25rem 0' }}>Interactive</h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>Explore connections visually</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Project Credentials */}
      <div style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e5e7eb',
        padding: '2rem 15%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h4 style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: '#111827', 
              margin: '0 0 0.5rem 0' 
            }}>Mapress</h4>
            <p style={{ 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              margin: '0' 
            }}>Real-time news mind mapping</p>
          </div>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'center'
          }}>
            <a 
              href="https://github.com/stqili" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.5rem',
                color: '#374151',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            
            <a 
              href="https://linkedin.com/in/stqili" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.5rem',
                color: '#374151',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn
            </a>
            
            <a 
              href="mailto:stevenqingli@gmail.com" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.5rem',
                color: '#374151',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#e5e7eb';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              Contact
            </a>
          </div>
        </div>
        
        <div style={{
          textAlign: 'center',
          fontSize: '0.75rem',
          color: '#9ca3af',
          borderTop: '1px solid #f3f4f6',
          paddingTop: '1rem',
          width: '100%'
        }}>
          <p style={{ margin: '0' }}>© 2025 Mapress. Built with Next.js and React Flow.</p>
        </div>
      </div>

    </div>
  );
}
