import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router';


const Header = () => {
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [channel_name, setChannel_name] = useState("");
  const walletDropdownRef = useRef(null);


  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(10);
  const [file, setFile] = useState(null);
  

  const isUploadDisabled = !(title && description && file);
  const c_name = useParams().channel_name;
  useEffect(() => {
    setChannel_name(c_name)
  }, [])
  const Navigate = useNavigate();
  const generateMockImages = (array_image_info) => {
    const newImages = [];
    let ind = 1;
   
    
    array_image_info.forEach(element => {

      newImages.push({
        id: ind,
        src: element.get_url,
        title: element.content_name,
        time: `${(Math.floor((Date.now()-element.timestamp) / (1000 * 60 * 60)))} hours ago`,
      });
      ind=ind+1;
      console.log(element.get_url);
      
    });


    return newImages;
  };

  const loadMoreImages = useCallback(async () => {
    if (loading) return;

    setLoading(true);

    // Simulate API delay
    let array_image_info = [];
    await fetch('/api/v1/channel/get_channel_content').then((res) => res.json()).then((res) => {
      if (res.status == 400) {
        alert("something went wrong");
      }
      else if (res.status == 450) {
        Navigate('/signup');
      }
      else return res.data.images;
    }).then((res) => {
      array_image_info = res;
    }).catch((err) => {
      console.log(err);
      alert("some error occured");
    })
    const newImages = generateMockImages(array_image_info);
    
    
    setImages(newImages);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMoreImages();
  }, []);

 
 

  

  const handleDeleteImage = async (image, event) => {
    event.preventDefault(); // Prevent the link from being followed
    event.stopPropagation(); // Prevent event bubbling
    console.log('Deleting image:', {
      id: image.id,
      title: image.title,
      price: image.price,
      src: image.src,
      link: image.link
    });
    // Remove the image from the images array
    const url = image.src;
    let content_id = (url.match(/amazonaws\.com\/([^?]+)/) || [])[1] || '';
    content_id=content_id.replace("uploads/","")
    await fetch('/api/v1/channel/delete_content', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        content_id: content_id
      })
    }).then((res) => res.json()).then((res) => {
      if (res.status == 400) {
        throw "something went wrong"
      }
      setImages(prev => prev.filter(img => img.id !== image.id));
    }).catch((err) => {
      alert(err);
    })
  };
  const handleUpload = async () => {
    if (price > 1000 || price<1) {
      alert("price cant be above 1000 or less than 1");
      return;
    }
    let url;
    let fields;
     const allowed_file_types=['image/png','image/jpeg','image/gif'];
       if (!allowed_file_types.includes(file.type)) {
        alert("this file type is not allowed only png and jpeg is allowed");
        return;
       }
       if (images.length>1) {
        alert("sorry currently you can only upload 2 images");
        return;
       }
    await fetch('/api/v1/channel/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        file_name: file.name,
        file_type: file.type
      })
    }).then((res) => res.json()).then((res) => {
      console.log("called");

      if (res.status == 400) {
        throw "something went wrong"
      }
      url = res.data.url;
      fields = res.data.fields;
      alert("file upload started please wait for completion alert");
    }).then(async () => {
      const formData = new FormData();

      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value);
      });

      formData.append('file', file);

      await fetch(url, {
        method: 'POST',
        body: formData
      })
        .then(async (res) => {
          if (!res.ok) {
            throw "something went wrong"
          }
          // edit
          await fetch('/api/v1/channel/edit_content', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              content_id: (fields.key).replace("uploads/", ""),
              content_name: title,
              content_description: description,
              price: price

            })
          }).then((res) => res.json()).then((res) => {
            if (res.status == 400) {
              throw "something went wrong"
            }
            alert("upload completed");
            window.location.reload()
            //Navigate(`/channel/${channel_name}`)

          }).catch((err) => {
            alert(err);
          })
        })
        .catch((err) => {
          throw err;

        });
    }).catch((err) => {
      alert(err)
    })








  }

 
  return (
    <div className="min-h-screen bg-neutral-900">
      <header className="bg-neutral-800 border-b border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-white cursor-pointer" onClick={() => { Navigate('/') }}>Placient</h1>
            <div className="flex-1 max-w-lg mx-8 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400"
              />
            </div>
            <div className="relative mr-4" ref={walletDropdownRef}>
              <button
                onClick={() => setIsWalletDropdownOpen(!isWalletDropdownOpen)}
                className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-neutral-700 rounded-lg"
              >
                <span></span>
                {/* <ChevronDown className={`h-4 w-4 transition-transform ${isWalletDropdownOpen ? 'rotate-180' : ''}`} /> */}
              </button>
           
            </div>
            <div className="text-white font-medium px-4 py-2">{channel_name}</div>
          </div>
        </div>
      </header>

      <main className="bg-neutral-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <h2 className="text-2xl font-bold text-white mb-8">Your images...</h2>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              {images.map((image) => (
                <a key={image.id}

                  className="bg-neutral-800 rounded-lg p-4 hover:bg-neutral-700 transition relative"
                >
                  <button
                    onClick={(e) => handleDeleteImage(image, e)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 z-10 cursor-pointer "
                    title="Delete image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <img src={image.src} alt={image.title} className="w-full h-48 object-cover rounded" onClick={() => {
                    const url = image.src;
                    let content_id = ((url.match(/amazonaws\.com\/([^?]+)/) || [])[1] || '');
    content_id=content_id.replace("uploads/","");
                    Navigate(`/video/${content_id}`)

                  }} />
                  <h3 className="text-white mt-2">{image.title}</h3>
                  <p className="text-green-400 text-sm">{image.price}</p>
                </a>
              ))}
            </div>

            {/* Right Panel */}
            <div className="w-full lg:w-72 bg-neutral-800 rounded-lg border border-neutral-700 flex flex-col">
              <div className="p-4 space-y-4 sticky top-24">
                {/* Top Half - Upload Form */}
                <div>
                  <h3 className="text-white font-bold mb-4">Upload content</h3>
                  <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mb-3 px-3 py-2 rounded bg-neutral-700 text-white placeholder-neutral-400"
                  />
                  <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full mb-3 px-3 py-2 rounded bg-neutral-700 text-white placeholder-neutral-400"
                  />
                  <input
                    type='number'
                    placeholder="Price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full mb-3 px-3 py-2 rounded bg-neutral-700 text-white placeholder-neutral-400"
                  />
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="w-full mb-4 text-white rounded-full bg-neutral-700 file:rounded-full file:border-none file:bg-green-600 file:text-white file:px-4 file:py-2 file:cursor-pointer"
                  />
                  <button
                    disabled={isUploadDisabled}
                    className={`w-full py-2 rounded font-semibold ${isUploadDisabled ? 'bg-neutral-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'} text-white`}
                    onClick={handleUpload}
                  >
                    Upload
                  </button>
                </div>

                {/* Bottom Half - Channel Analytics */}
                <div className="text-white text-sm">
                  <h4 className="font-bold mb-3 text-lg">Channel Analytics</h4>
                  <ul className="space-y-2">
                    <li>Revenue: $0</li>
                    <li>Profit: $0</li>
                    <li>Videos Listed: 0</li>
                    <li>Videos Sold: 0</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>
      </main>

     
    </div>
  );
};

export default Header;