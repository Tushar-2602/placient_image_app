import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import {  useNavigate, useParams } from 'react-router';

const Channel_page = () => {

  const [searchQuery, setSearchQuery] = useState('');

  const [userCoins, setUserCoins] = useState(0);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [channel_name, setChannel_name] = useState("loading");

  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const observerRef = useRef(null);

  // Generate mock images
  const Navigate=useNavigate();
  const generateMockImages = (array_image_info) => {
    const newImages = [];
    let i=0;
    
    array_image_info.forEach(element => {
       newImages.push({
        id: i++,
        src: element.get_url,
        price: element.is_bought?"bought":element.price,
        title: element.name,
        time: `${(Math.floor((Date.now()-element.timestamp) / (1000 * 60 * 60)))} hours ago`,
        is_bought: element.is_bought // Empty links for videos with price
      });
      setChannel_name(element.channel_name)
    });
    
    
    return newImages;
  };

  // Load more images
  const{channel_id}=useParams()
const loadMoreImages = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    
    // Simulate API delay
    let array_image_info=[];
    await fetch(`/api/v1/user/get_channel_content_user/${channel_id}`).then((res)=>res.json()).then((res)=>{
      if (res.status==400) {
        alert("something went wrong");
      }
      else if (res.status==450) {
        Navigate('/signup');
        throw "login"
      }
      else return res.data.images;
    }).then((res)=>{
      array_image_info=res;
      const newImages = generateMockImages(array_image_info);
      setImages(newImages);
      setLoading(false);
    }).catch((err)=>{
      console.log(err);
      alert("some error occured");
    })
  }, []);

  // Initial load
  useEffect(() => {
    loadMoreImages();
  }, []);

 

 const handleImageClick = (image) => {
    // Check if link exists and is not empty
    const url=image.src;
    let content_id = (url.match(/amazonaws\.com\/([^?]+)/) || [])[1] || '';
    content_id = content_id.replace("uploads/","");
    if (image.is_bought) {
      try {
        // Check if it's a valid URL
        Navigate(`/video/${content_id}`)
      } catch (error) {
        console.log('Invalid URL:', content_id);
        // Do nothing for invalid URLs
      }
    } else {
      // Show buy modal if link is empty
      setSelectedVideo(image);
      setShowBuyModal(true);
    }
  };


    const handleBuyNow = async () => {
    const videoPrice = (selectedVideo.price);
    const url=selectedVideo.src;
    let content_id = (url.match(/amazonaws\.com\/([^?]+)/) || [])[1] || '';
    content_id = content_id.replace("uploads/","");
    if (userCoins >= videoPrice) {
    const formData = new URLSearchParams();
formData.append("content_id", content_id);

await fetch("/api/v1/user/purchase", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: formData,
}).then((res)=>res.json()).then((res)=>{
if (res.status==400) {
          alert("something went wrong or not enough coins");
        }
        else{
          if (res.status==201) {
            Navigate('/user/previous_bought')
          }
        }
}).catch((err)=>{
        alert("something went wrong");
        console.log(err);
        
      })
      alert(`Successfully purchased "${selectedVideo.title}" for $${videoPrice}!`);
    } else {
      alert(`Insufficient coins! You need $${videoPrice} but have ${userCoins} coins.`);
    }
    
    setShowBuyModal(false);
    setSelectedVideo(null);
  };

  const handleCloseBuyModal = () => {
    setShowBuyModal(false);
    setSelectedVideo(null);
  };



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
        </div>
      </div>
    </header>
    
    {/* Main content area with dark background */}
    <main className="bg-neutral-900 min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-8 text-center">{channel_name}</h2>
        
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

    {/* Buy Modal */}
    {showBuyModal && selectedVideo && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-800 rounded-lg max-w-md w-full p-6 border border-neutral-700">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-4">Purchase Video</h3>
            <div className="mb-4">
              <img
                src={selectedVideo.src}
                alt={selectedVideo.title}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h4 className="text-white font-medium mb-1">{selectedVideo.title}</h4>
              <p className="text-neutral-400 text-sm">{selectedVideo.channel}</p>
            </div>
            <div className="mb-6">
              <div className="text-2xl font-bold text-green-400 mb-2">{selectedVideo.price}</div>
              <p className="text-neutral-300 text-sm">Get instant access to this video</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCloseBuyModal}
                className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleBuyNow}
                className="flex-1 px-4 py-2 bg-neutral-500 text-white rounded-lg hover:bg-neutral-500 transition-colors duration-200 font-medium"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default Channel_page;