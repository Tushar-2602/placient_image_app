import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, Plus } from 'lucide-react';
import { useNavigate } from 'react-router';


const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownItems, setDropdownItems] = useState([]);
  const [walletItems, setWalletItems] = useState([]);
  const [userCoins, setUserCoins] = useState(0);
  const [showAddCoinsModal, setShowAddCoinsModal] = useState(false);
  const [showPreviouslyBoughtModal, setShowPreviouslyBoughtModal] = useState(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [purchasedVideos, setPurchasedVideos] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
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
        price: element.is_bought==1?"bought":element.price,
        title: element.name,
        channel: `Channel ${element.channel_name}`,
        time: `${(Math.floor((Date.now()-element.timestamp) / (1000 * 60 * 60)))} hours ago`,
        is_bought: element.is_bought // Empty links for videos with price
      });
      console.log(element.is_bought);
      
    });
    
    
    return newImages;
  };

  // Load more images
  const loadMoreImages = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    
    // Simulate API delay
    let array_image_info=[];
    await fetch('/api/v1/user/get_thumbnails',{cache:"no-store"}).then((res)=>res.json()).then((res)=>{
       if (res.status == 450) {
        Navigate('/signup');
        throw "please login"
      }
      else if (res.status==400) {
        throw "something went wrong";
      }
      else return res.data.images;
    }).then((res)=>{
      array_image_info=res;
      const newImages = generateMockImages(array_image_info);
      setImages(newImages);
      setLoading(false);
    }).catch((err)=>{
      console.log(err);
      alert(err);
    })
  }, []);

  // Initial load
  useEffect(() => {
    loadMoreImages();
  }, []);

  // Intersection Observer for infinite scroll
 
  useEffect(() => {
    const fetchDropdownItems = async () => {
      // Simulating API call - returns array of strings
      const mockApiResponse = [];
      await fetch('/api/v1/user/get_channels',{cache:"no-store"}).then((res)=>res.json()).then((res)=>{
        if (res.status==400) {
          throw "something went wrong";
        }
        else if (res.status == 450) {
        Navigate('/signup');
        throw "please login"
      }
        else return res.data.channel_names;
      }).then((res)=>{
        res.forEach(element => {
          mockApiResponse.push(element);
        });
        // Convert strings to objects with generated IDs
        const formattedItems = mockApiResponse.map((item, index) => ({
          id: index + 1,
          label: item
        }));
        
        setDropdownItems(formattedItems);
      }).catch((err)=>{
        if (err!="please login") {
          alert(err)
        };
      })
      
    };

    const fetchWalletData = async () => {
      // Simulating API call for wallet data
      await fetch('/api/v1/user/get_coins',{cache:"no-store"}).then((res)=>res.json()).then((res)=>{
        if (res.status==400) {
          throw "something went wrong";
        }
      else if (res.status == 450) {
        Navigate('/signup');
        throw "please login"
      }
        else return res.data.coins;
      }).then((res)=>{
        setUserCoins(res);
        const WalletResponse = {
       
          items: ['Add Coins', 'Previously Bought']
        };
        
        // Convert strings to objects with generated IDs
        const formattedWalletItems = WalletResponse.items.map((item, index) => ({
          id: index + 1,
          label: item
        }));
        
        setWalletItems(formattedWalletItems);
      }).catch((err)=>{
        if (err!="please login") {
          alert(err)
        };
        console.log(err);
        
      })
    };

    fetchDropdownItems();
    fetchWalletData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (walletDropdownRef.current && !walletDropdownRef.current.contains(event.target)) {
        setIsWalletDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    // Add your search logic here
  };

  const handleImageClick = (image) => {
    // Check if link exists and is not empty
    const url=image.src;
    let content_id = ((url.match(/amazonaws\.com\/([^?]+)/) || [])[1] || '');
    content_id=content_id.replace("uploads/","");
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

  const handleWalletItemClick = (item) => {
    console.log('Wallet item clicked:', item.label);
    setIsWalletDropdownOpen(false);
    
    if (item.label === 'Add Coins') {
      setShowAddCoinsModal(true);
    } else if (item.label === 'Previously Bought') {
      //setShowPreviouslyBoughtModal(true);
      Navigate('/user/previous_bought')
    }
  };

  const handleBuyNow = async () => {
    const videoPrice = (selectedVideo.price);
    const url=selectedVideo.src;
    let content_id = (url.match(/amazonaws\.com\/([^?]+)/) || [])[1] || '';
    console.log(content_id);
    
    content_id=content_id.replace("uploads/","");
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
          throw "something went wrong or not enough coins";
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
    } else {
      alert(`Insufficient coins!`);
    }
    
    setShowBuyModal(false);
    setSelectedVideo(null);
  };

  const handleAddCoins = async (amount) => {
    const formData = new URLSearchParams();
formData.append("amount", amount);
await fetch('/api/v1/user/add_coins', {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: formData,
}).then((res)=>res.json()).then((res)=>{
      if (res.status==400) {
        throw "something went wrong or you have reached coins limit";
         
      }
      return res.data.coins;
    }).then((res)=>{
      setUserCoins(res);
    }).catch((err)=>{
      console.log("something went wrong ");
      console.log(err);
      
    })
    setShowAddCoinsModal(false);

  };

  const handleCloseBuyModal = () => {
    setShowBuyModal(false);
    setSelectedVideo(null);
  };

  const handleDropdownItemClick = (item) => {
    console.log('Clicked:', item.label);
    setIsDropdownOpen(false);
    // Add your navigation logic here
    Navigate(`channel/${item.label}`)
  };

  const handleCreateChannelClick = () => {
    setIsDropdownOpen(false);
    setShowCreateChannelModal(true);
  };

  const handleCreateChannelSubmit = async() => {
    if (dropdownItems>0) {
      alert("sorry only 1 channel is allowed");
      return;
    }
    if (!(/^[a-zA-Z0-9]{5,20}$/.test(channelName))) {
      alert("only numbers and letters are allowed and length must be 5 to 20 chars");
      return;
    }
    if (channelName.trim()) {
      const formData = new URLSearchParams();
formData.append("channel_name", channelName);

await fetch("/api/v1/user/create_channel", {
  method: "POST",
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
  body: formData,
}).then((res)=>res.json()).then((res)=>{
  if (res.status==400) {
          throw "something went wrong, you can only create one channel";
          
        }
        else{
          const mockApiResponse=[channelName];
          const formattedItems = mockApiResponse.map((item, index) => ({
        id: index + 1,
        label: item
      }));
      
      setDropdownItems(formattedItems);
        }
}).catch((err)=>{
  alert(err);
  
})
      
      // Reset and close modal
      setChannelName('');
      setShowCreateChannelModal(false);
    }
  };

  const handleCloseCreateChannelModal = () => {
    setChannelName('');
    setShowCreateChannelModal(false);
  };
   const handleLogout = async () => {
    await fetch('/api/v1/user/logout').then((res)=>res.json()).then((res)=>{
      if (res.status==400) {
        throw "something went wrong";
      }
      else{
        Navigate('/signup')
      }
    }).catch((res)=>{
      alert(res);
    })
  };
  return (
    <div className="min-h-screen bg-neutral-900">
      <header className="bg-neutral-800 shadow-sm border-b border-neutral-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo - Left */}
          <div className="flex-shrink-0 -ml-2">
            <h1 className="text-2xl font-bold text-white hover:text-neutral-200 cursor-pointer">
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
              <span className="font-medium">{userCoins} Coins</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isWalletDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Wallet Dropdown Menu */}
            {isWalletDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 py-1 z-50">
                {/* Coins Display */}
                <div className="px-4 py-2 text-white border-b border-neutral-600">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-400">Available Coins</span>
                    <span className="font-bold text-green-400">{userCoins}</span>
                  </div>
                </div>
                
                {/* Wallet Items */}
                {walletItems.map((item) => {
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleWalletItemClick(item)}
                      className="w-full px-4 py-2 text-left text-white hover:bg-neutral-500 cursor-pointer transition-all duration-200"
                    >
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Channel Dropdown - Right */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 px-4 py-2 text-white hover:text-neutral-200 hover:bg-neutral-700 rounded-lg transition-colors duration-200"
            >
              <span className="font-medium">Your Channel</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />

            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-neutral-800 rounded-lg shadow-lg border border-neutral-700 py-1 z-50">
                {/* Create Channel - Always first */}
                <div
                  onClick={handleCreateChannelClick}
                  className="w-full px-4 py-2 text-left text-white hover:bg-neutral-500 cursor-pointer flex items-center space-x-3 transition-all duration-200"
                >
                  <Plus className="h-4 w-4 text-white" />
                  <span>Create Channel</span>
                </div>
                
                {/* Divider */}
                <div className="border-t border-neutral-600 my-1"></div>
                
                {/* API Items */}
                {dropdownItems.map((item) => {
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleDropdownItemClick(item)}
                      className="w-full px-4 py-2 text-left text-white hover:bg-neutral-500 cursor-pointer transition-all duration-200"
                    >
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <span className="font-medium cursor-pointer" onClick={handleLogout}>Logout</span>
        </div>
      </div>
    </header>
    
    {/* Main content area with dark background */}
    <main className="bg-neutral-900 min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-8">
        {/* Title */}
        <h2 className="text-2xl font-bold text-white mb-8">Something to watch</h2>
        
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

    {/* Create Channel Modal */}
    {showCreateChannelModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-800 rounded-lg max-w-md w-full p-6 border border-neutral-700">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-6">Create New Channel</h3>
            
            {/* Channel Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-300 mb-2 text-left">
                Channel Name
              </label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="Enter your channel name..."
                className="w-full px-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:ring-0 focus:border-neutral-500 outline-none transition-all duration-200"
                autoFocus
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCloseCreateChannelModal}
                className="flex-1 px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateChannelSubmit}
                disabled={!channelName.trim()}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  channelName.trim()
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
                }`}
              >
                Create Channel
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

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

    {/* Add Coins Modal */}
    {showAddCoinsModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-800 rounded-lg max-w-md w-full p-6 border border-neutral-700">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-4">Add Coins</h3>
            <p className="text-neutral-300 text-sm mb-6">Current Balance: <span className="text-green-400 font-bold">{userCoins} coins</span></p>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => handleAddCoins(100)}
                className="p-4 bg-neutral-700 hover:bg-neutral-500 rounded-lg transition-colors duration-200"
              >
                <div className="text-white font-bold">100 Coins</div>
                <div className="text-green-400 text-sm">$10.00</div>
              </button>
              <button
                onClick={() => handleAddCoins(250)}
                className="p-4 bg-neutral-700 hover:bg-neutral-500 rounded-lg transition-colors duration-200"
              >
                <div className="text-white font-bold">250 Coins</div>
                <div className="text-green-400 text-sm">$25.00</div>
              </button>
              <button
                onClick={() => handleAddCoins(500)}
                className="p-4 bg-neutral-700 hover:bg-neutral-500 rounded-lg transition-colors duration-200"
              >
                <div className="text-white font-bold">500 Coins</div>
                <div className="text-green-400 text-sm">$50.00</div>
              </button>
              <button
                onClick={() => handleAddCoins(1000)}
                className="p-4 bg-neutral-700 hover:bg-neutral-500 rounded-lg transition-colors duration-200"
              >
                <div className="text-white font-bold">1000 Coins</div>
                <div className="text-green-400 text-sm">$100.00</div>
              </button>
            </div>
            
            <button
              onClick={() => setShowAddCoinsModal(false)}
              className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Previously Bought Modal */}
    {showPreviouslyBoughtModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-neutral-800 rounded-lg max-w-2xl w-full p-6 border border-neutral-700 max-h-96 overflow-y-auto">
          <div className="text-center mb-4">
            <h3 className="text-xl font-bold text-white">Previously Bought Videos</h3>
          </div>
          
          {purchasedVideos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-400">No videos purchased yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchasedVideos.map((video, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-neutral-700 rounded-lg">
                  <img
                    src={video.src}
                    alt={video.title}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-sm">{video.title}</h4>
                    <p className="text-neutral-400 text-xs">{video.channel}</p>
                    <p className="text-green-400 text-xs">Purchased: {video.purchaseDate}</p>
                  </div>
                  <div className="text-green-400 font-bold text-sm">{video.price}</div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={() => setShowPreviouslyBoughtModal(false)}
              className="w-full px-4 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default Header;