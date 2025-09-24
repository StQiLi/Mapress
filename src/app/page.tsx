"use client";

import { useState, useCallback } from "react";
import LandingPage from "@/components/LandingPage";
import MapViewPage from "@/components/MapViewPage";

type AppState = "landing" | "loading" | "map";

export default function Home() {
  const [appState, setAppState] = useState<AppState>("landing");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [sources, setSources] = useState<string[]>([]);
  const [nodes, setNodes] = useState<any[]>([]);
  const [edges, setEdges] = useState<any[]>([]);

  const handleGenerate = useCallback(async (searchQuery: string) => {
    setQuery(searchQuery);
    setAppState("loading");
    setIsLoading(true);
    setStatus("search");
    setSources([]);
    setNodes([]);
    setEdges([]);

    try {
      // Simulate progress steps
      setStatus("search");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStatus("fetch");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStatus("cluster");
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setStatus("layout");
      
      const response = await fetch("/api/map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: searchQuery.trim(),
          recencyDays: 7,
          maxSources: 8,
          depth: 2
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the new format to the old format for compatibility
      const nodeValues = Object.values(data.nodes);
      const centerX = 0;
      const centerY = 0;
      const radius = Math.max(150, nodeValues.length * 40);
      const angleStep = (2 * Math.PI) / nodeValues.length;
      
      const transformedNodes = nodeValues
        .filter((node: any) => node && node.id)
        .map((node: any, index: number) => {
          const angle = index * angleStep;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          
          return {
            id: node.id,
            type: "category",
            position: { x, y },
            data: {
              title: node.title,
              summary: node.summary,
              sources: node.citations || [],
              facts: [], // New format doesn't have nested facts
              // Pass through the new verbose fields
              keyPoints: node.keyPoints || [],
              context: node.context || "",
              implications: node.implications || "",
              relatedTopics: node.relatedTopics || []
            }
          };
        });

      const transformedEdges = data.edges.map((edge: any, index: number) => ({
        id: `edge-${index}`,
        source: edge.from,
        target: edge.to,
        label: edge.label || ""
      }));

      setNodes(transformedNodes);
      setEdges(transformedEdges);
      setStatus("done");
      
      // Extract sources from citations
      const allSources = Object.values(data.nodes).flatMap((node: any) => 
        (node.citations || []).map((citation: any) => citation.url)
      );
      setSources([...new Set(allSources)]);
      
      // Switch to map view
      setTimeout(() => {
        setAppState("map");
      }, 1000);

    } catch (error) {
      console.error("Error generating map:", error);
      setStatus("error");
      // Return to landing on error
      setTimeout(() => {
        setAppState("landing");
      }, 2000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleBack = useCallback(() => {
    setAppState("landing");
    setQuery("");
    setNodes([]);
    setEdges([]);
    setSources([]);
    setStatus("");
  }, []);

  // Conditional rendering based on app state
  if (appState === "landing") {
    return (
      <LandingPage 
        onGenerate={handleGenerate}
        isLoading={isLoading}
      />
    );
  }

  if (appState === "loading") {
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
              padding: 'clamp(2rem, 4vw, 3rem)',
              animation: 'warpBox 2s ease-in-out infinite alternate'
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
                
                {/* Loading Bar */}
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '1rem'
                }}>
                  <div style={{
                    height: '100%',
                    background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981, #6366f1, #3b82f6)',
                    backgroundSize: '300% 300%',
                    animation: 'gradientFlow 2s ease-in-out infinite, loadingProgress 10s ease-in-out forwards',
                    borderRadius: '4px'
                  }}></div>
                </div>

                {/* Animated Loading Text */}
                <div style={{
                  color: '#6b7280',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  minHeight: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    animation: 'fadeInOut 2s ease-in-out infinite'
                  }}>
                    {status === 'search' && '🔍 Searching the latest news...'}
                    {status === 'fetch' && '📥 Downloading article content...'}
                    {status === 'cluster' && '🔗 Identifying story connections...'}
                    {status === 'layout' && '🗺️ Creating nodes and connections...'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Map view (appState === "map")
  return (
    <MapViewPage
      nodes={nodes}
      edges={edges}
      onBack={handleBack}
    />
  );
}
