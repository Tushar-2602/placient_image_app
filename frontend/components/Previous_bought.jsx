import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';

const Previous_bought = () => {

  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);
  const walletDropdownRef = useRef(null);
  const observerRef = useRef(null);
    const Navigate=useNavigate();
  // Generate mock images
  const generateMockImages = (array_image_info) => {
    const newImages = [];
    let i=0;
    
    array_image_info.forEach(element => {
       newImages.push({
        id: i++,
        src: element.get_url,
        title: element.content_name,
        channel: `Channel ${element.channel_name}`,
        time: `${(Math.floor((Date.now()-element.timestamp) / (1000 * 60 * 60)))} hours ago`,
      });
    });
    
    
    return newImages;
  };

  // Load more images
 const loadMoreImages = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    
    // Simulate API delay
    let array_image_info=[];
    await fetch('/api/v1/user/get_previous_bought').then((res)=>res.json()).then((res)=>{
      if (res.status==400) {
        alert("something went wrong");
      }
      else if (res.status==450) {
              Navigate('/signup');
            }
      else return res.data.images;
    }).then((res)=>{
      array_image_info=res;
    }).catch((err)=>{
      console.log(err);
      alert("some error occured");
    })
    const newImages = generateMockImages(array_image_info);
    setImages(newImages);
    setLoading(false);
  }, []);

  // Initial load
  useEffect(() => {
    loadMoreImages();
  }, []);


  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    // Add your search logic here
  };

  const handleImageClick = (image) => {
    // Check if link exists and is not empty
    const url=image.src;
    let content_id = (url.match(/amazonaws\.com\/([^?]+)/) || [])[1] || '';
  content_id=content_id.replace("uploads/","");
        // Check if it's a valid URL
        Navigate(`/video/${content_id}`)
    
  };


  return (
    <div className="min-h-screen bg-neutral-900">
      <header className="bg-neutral-800 shadow-sm border-b border-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo - Left */}
          <div className="flex-shrink-0 -ml-2" >
            <h1 className="text-2xl font-bold text-white hover:text-neutral-200 cursor-pointer" onClick={()=>{Navigate('/')}}>
              Placient
            </h1>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  autoComplete="off"
                  className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:ring-0 focus:border-neutral-500 outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Wallet Dropdown - Right */}
          <div className="relative mr-4" ref={walletDropdownRef}>
            <button
              onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 text-white hover:text-neutral-200 hover:bg-neutral-700 rounded-lg transition-colors duration-200"
            >
              
            </button>

            
          </div>

          {/* Channel Dropdown - Right */}
          <div className="relative" ref={dropdownRef}>
   
           
          </div>
        </div>
      </div>
    </header>
    
    {/* Main content area with dark background */}
    <main className="bg-neutral-900 min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-8 text-center">Previously bought.....</h2>
        
        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <div 
              key={image.id} 
              className="bg-neutral-800 rounded-lg overflow-hidden hover:bg-neutral-700 transition-colors duration-200 cursor-pointer"
              onClick={() => handleImageClick(image)}
            >
              <div className="aspect-video">
                <img
                  src={image.src}
                  alt={image.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-400 font-bold text-sm">{image.price}</span>
                  <h3 className="text-white font-medium text-sm line-clamp-2 flex-1">
                    {image.title}
                  </h3>
                </div>
                <p className="text-neutral-400 text-xs mb-1">{image.channel}</p>
                <div className="flex items-center text-neutral-400 text-xs">
                  <span>{image.views}</span>
                  <span className="mx-1">•</span>
                  <span>{image.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}

        {/* Intersection observer target */}
        <div ref={observerRef} className="h-10"></div>
      </div>
    </main>

    
    
  </div>
  );
};

export default Previous_bought;