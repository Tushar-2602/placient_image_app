import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";


export default function PlacientAuthPage() {
  const Navigate = useNavigate();
 useEffect(() => {
    const checkToken = async () => {
      try {
        let res = await fetch('/api/v1/user/check_token',{cache:"no-store"});
        if (res.status == 201) {
          Navigate('/'); // use 'navigate', not 'Navigate'
        }
      } catch (err) {
        alert(err);
      }
    };

    checkToken();
  }, []);
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    emailOrUsername: "" // For login
  });
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Regex patterns
  const regx_name = /^(?!-)[A-Za-z-]{5,20}(?<!-)$/;
  const regx_email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const regx_username = /^(?=.*[A-Za-z])(?!.*\s)[A-Za-z0-9._\-]{4,25}$/;
  const regx_password = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()~`\[\];'./{}:"?><,\-=_+])[A-Za-z\d!@#$%^&*()~`\[\];'./{}:"?><,\-=_+]{8,16}$/;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  const validateForm = () => {
    const validationErrors = [];

    if (isSignup) {
      // Signup validation - all fields required
      if (!formData.name.trim()) {
        validationErrors.push("Name is required");
      } else if (!regx_name.test(formData.name)) {
        validationErrors.push("Name must be 5-20 characters long, contain only letters and hyphens, and not start or end with a hyphen");
      }

      if (!formData.email.trim()) {
        validationErrors.push("Email is required");
      } else if (!regx_email.test(formData.email)) {
        validationErrors.push("Please enter a valid email address");
      }

      if (!formData.username.trim()) {
        validationErrors.push("Username is required");
      } else if (!regx_username.test(formData.username)) {
        validationErrors.push("Username must be 4-25 characters, contain at least one letter, and only use letters, numbers, dots, underscores, and hyphens");
      }
    } else {
      // Login validation - email or username required
      if (!formData.emailOrUsername.trim()) {
        validationErrors.push("Email or username is required");
      } else {
        const isEmail = formData.emailOrUsername.includes('@');
        if (isEmail && !regx_email.test(formData.emailOrUsername)) {
          validationErrors.push("Please enter a valid email address");
        } else if (!isEmail && !regx_username.test(formData.emailOrUsername)) {
          validationErrors.push("Username must be 4-25 characters, contain at least one letter, and only use letters, numbers, dots, underscores, and hyphens");
        }
      }
    }

    // Password validation for both signup and login
    if (!formData.password.trim()) {
      validationErrors.push("Password is required");
    } else if (!regx_password.test(formData.password)) {
      validationErrors.push("Password must be 8-16 characters with at least one letter, one number, and one special character");
    }

    return validationErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors([]);

    
      const submitData = new URLSearchParams();
      
      if (isSignup) {
        // Signup - send all required fields
        submitData.append("name", formData.name);
        submitData.append("email", formData.email);
        submitData.append("username", formData.username);
        submitData.append("password", formData.password);
        
        await fetch('/api/v1/user/register', {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: submitData,
        }).then((res)=>res.json()).then((res)=>{
          if (res.status==400) {
            throw "something went wrong"
          }
          else if (res.status==451) {
            setIsSubmitting(0)
            throw "user already exists or same ip"
          }
          else Navigate('/')
        }).catch((err)=>{
          alert(err);
        });
      } else {
        // Login - send email/username and password
        const isEmail = formData.emailOrUsername.includes('@');
        if (isEmail) {
          submitData.append("access_id", formData.emailOrUsername);
          submitData.append("access_type", "0");
        } else {
          submitData.append("access_id", formData.emailOrUsername);
          submitData.append("access_type", "1");
        }
        submitData.append("password", formData.password);
        
         await fetch('/api/v1/user/login', {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: submitData,
        }).then((res)=>res.json()).then((res)=>{
          console.log(res.status);
          
          if (res.status==400) {
            throw "something went wrong"
          }
          else if (res.status==452) {
            setIsSubmitting(0)
            throw "wrong credentials"
          }
          else {Navigate('/')}
        }).catch((err)=>{
          alert(err);
        })
        ;

        
        
    
      }
    
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setErrors([]);
    setFormData({
      name: "",
      email: "",
      username: "",
      password: "",
      emailOrUsername: ""
    });
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-neutral-800 shadow-lg rounded-2xl p-6 space-y-6">
        <h1 className="text-3xl font-bold text-center text-white">Placient</h1>

        {/* Error Display */}
        {errors.length > 0 && (
          <div className="bg-red-900/50 border border-red-500 rounded-md p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">!</span>
              </div>
              <h3 className="text-sm font-medium text-red-300">Please fix the following errors:</h3>
            </div>
            <ul className="text-sm text-red-200 space-y-1 ml-7">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-4">
          {/* Signup Fields */}
          {isSignup && (
            <>
              <div>
                <label className="block text-sm mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name"
                  className="w-full px-4 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Choose a username"
                  className="w-full px-4 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          {/* Login Field */}
          {!isSignup && (
            <div>
              <label className="block text-sm mb-1">Email or Username</label>
              <input
                type="text"
                name="emailOrUsername"
                value={formData.emailOrUsername}
                onChange={handleInputChange}
                placeholder="Email or Username"
                className="w-full px-4 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Password Field */}
          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className="w-full px-4 py-2 bg-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            />
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white py-2 rounded-md transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{isSignup ? "Signing Up..." : "Logging In..."}</span>
              </span>
            ) : (
              isSignup ? "Sign Up" : "Log In"
            )}
          </button>
        </div>

        <p className="text-center text-sm text-neutral-400">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="text-blue-400 hover:underline"
            disabled={isSubmitting}
          >
            {isSignup ? "Log In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  );
}