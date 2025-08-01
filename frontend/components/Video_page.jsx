import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';

const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const walletDropdownRef = useRef(null);
  const observerRef = useRef(null);

  // Generate mock images
  // src title channel time
  const {content_id}=useParams();
  const Navigate =useNavigate();
  useEffect(()=>{
    const get_image=async ()=>{
      await fetch(`/api/v1/user/get_content/${content_id}`).then((res)=>res.json()).then((res)=>{
        if (res.status==400) {
          throw "something went wrong";
        }
        else if (res.status==450) {
        Navigate('/signup');
      }
        else{
          setImages({
          "src":res.data.get_url,
          "title":res.data.content_name,
          "channel":res.data.channel_name,
          "time": `${(Math.floor((Date.now()-res.data.timestamp) / (1000 * 60 * 60)))} hours ago`,
          })
          //console.log(res.data.get_url);
          
        }
      }).catch((err)=>{
        alert(err);
      })
    }
    get_image();
  },[])
 

  return (
    <div className="min-h-screen bg-neutral-900">
      <header className="bg-neutral-800 shadow-sm border-b border-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo - Left */}
          <div className="flex-shrink-0 -ml-2">
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
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 text-white hover:text-neutral-200 hover:bg-neutral-700 rounded-lg transition-colors duration-200"
            >
              
            </button>

            
          </div>
        </div>
      </div>
    </header>
    
    {/* Main content area with dark background */}
  <main className="bg-neutral-900 min-h-screen px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto py-8 flex flex-col lg:flex-row gap-8">
    {/* Main Video Display Section */}
    <div className="flex-1">
      {images != undefined && (
        <div className="bg-neutral-800 rounded-lg overflow-hidden">
          <div className="aspect-video bg-black">
            <img
              src={images.src}
              alt={images.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-4">
            <h2 className="text-white text-xl font-bold mb-2">{images.title}</h2>
            
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-neutral-400 text-sm cursor-pointer" onClick={()=>{
                  const substringBeforePercent = str => str.split('~')[0];
                  const channel_id=substringBeforePercent(content_id);
                  Navigate(`/user/channel/${channel_id}`)
                }}>{images.channel}</p>
              </div>
              <button className="bg-neutral-700 hover:bg-neutral-600 text-white px-3 py-1 text-sm rounded-md transition duration-200">
                Follow
              </button>
            </div>

            <p className="text-neutral-500 text-sm">{images.time}</p>
          </div>
        </div>
      )}
    </div>

    {/* Suggestions Box (Heading Only) */}
    <div className="w-full lg:w-1/3">
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 p-4">
        <h3 className="text-white font-semibold text-lg">THIS IS A SAMPLE VIDEO PLAYING ILLUSTRATION</h3>
      </div>
    </div>
  </div>

  {/* Observer & Loader */}
  <div ref={observerRef} className="h-10"></div>
  {loading && (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>
  )}
</main>

    
  </div>
  );
};

export default Header;