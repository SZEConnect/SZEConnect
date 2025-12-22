import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [lang, setLang] = useState("hu");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    username: "",
    bio: "",
    interests: [], // Kept for UI, though DB might not save it yet
    password: "",
  });

  // Image State
  const [previewImage, setPreviewImage] = useState(null); // For showing the selected image
  const [selectedFile, setSelectedFile] = useState(null); // For sending to backend
  const [currentProfileImage, setCurrentProfileImage] = useState(null); // Store current DB image

  const [newInterest, setNewInterest] = useState("");

  // ===========================================
  // CRITICAL: Add this useEffect for debugging
  // ===========================================
  useEffect(() => {
    console.log("🟢 EditProfilePage MOUNTED");
    
    // Check if form exists in DOM
    setTimeout(() => {
      const formElement = document.querySelector('form');
      console.log("🔍 Form element found:", !!formElement);
      if (formElement) {
        console.log("📋 Form attributes:", {
          action: formElement.action,
          method: formElement.method,
          hasOnSubmit: !!formElement.onsubmit
        });
        
        // Check submit button
        const submitBtn = formElement.querySelector('button[type="submit"]');
        console.log("🔘 Submit button:", {
          exists: !!submitBtn,
          disabled: submitBtn?.disabled,
          text: submitBtn?.textContent
        });
      }
    }, 100);
    
    // Add click listener to detect clicks
    const handleDocumentClick = (e) => {
      if (e.target.tagName === 'BUTTON') {
        console.log("🖱️ Button clicked:", {
          type: e.target.type,
          text: e.target.textContent,
          disabled: e.target.disabled
        });
      }
    };
    
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // 1. Fetch Current User Data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        console.log("🔍 Fetching current profile data...");
        const data = await api.profile(token);
        
        if (data && data.user) {
          console.log("📥 Profile data received:", {
            username: data.user.username,
            bio: data.user.bio,
            profileImage: data.user.profileImage
          });
          
          setForm({
            username: data.user.username || "",
            bio: data.user.bio || "",
            interests: [], // Placeholder since DB doesn't have this column yet
            password: ""
          });
          
          if (data.user.profileImage) {
            setPreviewImage(data.user.profileImage);
            setCurrentProfileImage(data.user.profileImage);
          }
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
        alert(lang === "hu" ? "Nem sikerült betölteni a profil adatokat" : "Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate, lang]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle File Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("📸 New file selected:", file.name, file.type, file.size);
      setSelectedFile(file);
      // Create a fake URL to preview the image immediately
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleAddInterest = () => {
    if (newInterest.trim() && !form.interests.includes(newInterest.trim())) {
      setForm({ ...form, interests: [...form.interests, newInterest.trim()] });
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest) => {
    setForm({
      ...form,
      interests: form.interests.filter((i) => i !== interest),
    });
  };

  // ===========================================
  // FIXED: handleSubmit with better debugging
  // ===========================================
  const handleSubmit = async (e) => {
    console.log("🟢🟢🟢 handleSubmit FUNCTION EXECUTING!");
    console.log("Event received:", e.type, e.target);
    
    // CRITICAL: Prevent default
    e.preventDefault();
    e.stopPropagation();
    
    console.log("✅ Event prevented successfully");
    
    // Set submitting state
    setSubmitting(true);
    console.log("🔄 Submitting state set to: true");
    
    try {
      console.log("🟢 Starting profile update process...");
      
      const token = localStorage.getItem("token");
      console.log("🟢 Token exists?", !!token);
      console.log("🟢 Token:", token ? token.substring(0, 20) + "..." : "none");
      
      if (!token) {
        alert(lang === "hu" ? "Bejelentkezés szükséges" : "Login required");
        navigate("/login");
        return;
      }

      console.log("🟢 Current form data:", form);
      
      // Create FormData
      const formData = new FormData();
      
      // Append text fields with validation
      if (form.username.trim() !== "") {
        formData.append("username", form.username.trim());
        console.log("✅ Added username:", form.username.trim());
      } else {
        console.log("⏭️ Skipping username - empty");
      }
      
      if (form.bio !== undefined && form.bio !== null && form.bio.trim() !== "") {
        formData.append("bio", form.bio.trim());
        console.log("✅ Added bio:", form.bio.trim());
      } else {
        console.log("⏭️ Skipping bio - empty");
      }
      
      // Only append password if user typed one
      if (form.password && form.password.trim() !== "") {
        formData.append("password", form.password);
        console.log("✅ Added password (hidden)");
      } else {
        console.log("⏭️ Skipping password - empty");
      }
      
      // Append file if selected
      if (selectedFile) {
        formData.append("profileImage", selectedFile);
        console.log("✅ Added file:", selectedFile.name, `(${selectedFile.size} bytes)`);
      } else {
        console.log("⏭️ Skipping file - none selected");
      }

      // Log FormData contents
      console.log("📋 FormData entries:", Array.from(formData.entries()).length);
      if (Array.from(formData.entries()).length === 0) {
        console.log("⚠️ WARNING: FormData is empty! Nothing to update.");
        alert("Please make some changes before saving.");
        setSubmitting(false);
        return;
      }

      console.log("🟢 FormData contents:");
      for (let [key, value] of formData.entries()) {
        if (key === 'profileImage') {
          console.log(`  ${key}:`, value.name, `(${value.type}, ${value.size} bytes)`);
        } else if (key === 'password') {
          console.log(`  ${key}: ***`);
        } else {
          console.log(`  ${key}: "${value}"`);
        }
      }

      console.log("📤 Calling api.updateProfile...");
      console.log("URL: https://szeconnect.onrender.com/profile");
      console.log("Method: PUT");
      console.log("Has token:", !!token);
      
      // Try with fetch directly first to debug
      console.log("🧪 Testing with direct fetch first...");
      try {
        const testResponse = await fetch('https://szeconnect.onrender.com/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
            // Note: Don't set Content-Type for FormData
          },
          body: formData
        });
        
        console.log("📥 Direct fetch response status:", testResponse.status);
        console.log("📥 Direct fetch response ok:", testResponse.ok);
        
        const testData = await testResponse.json();
        console.log("📥 Direct fetch response data:", testData);
        
        if (testResponse.ok) {
          console.log("✅ Direct fetch successful!");
          alert(lang === "hu" ? "✅ Profil sikeresen frissítve!" : "✅ Profile updated successfully!");
          
          // Verify immediately
          console.log("🔄 Fetching fresh profile data...");
          const freshData = await api.profile(token);
          console.log("🔄 Fresh data:", freshData.user);
          
          navigate("/profile");
          return;
        } else {
          console.log("❌ Direct fetch failed:", testData.message);
          alert(testData.message || "Update failed");
        }
      } catch (fetchError) {
        console.error("❌ Direct fetch error:", fetchError);
      }
      
      // If direct fetch didn't work, try API wrapper
      console.log("🔄 Trying api.updateProfile wrapper...");
      const response = await api.updateProfile(formData, token);
      console.log("🔄 API wrapper response:", response);
      
      if (response.success) {
        console.log("✅ Update successful via API wrapper!");
        alert(lang === "hu" ? "✅ Profil sikeresen frissítve!" : "✅ Profile updated successfully!");
        
        // Verify immediately
        console.log("🔄 Fetching fresh profile data...");
        const freshData = await api.profile(token);
        console.log("🔄 Fresh data:", freshData.user);
        
        navigate("/profile");
      } else {
        console.log("❌ API wrapper failed:", response.message);
        alert(response.message || (lang === "hu" ? "Hiba a mentéskor." : "Error saving changes."));
      }
    } catch (error) {
      console.error("❌❌❌ CRITICAL ERROR in handleSubmit:");
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      alert(error.message || (lang === "hu" ? "Nem sikerült frissíteni a profilt" : "Failed to update profile"));
    } finally {
      console.log("🔄 Setting submitting to false");
      setSubmitting(false);
    }
  };

  // ===========================================
  // DEBUG FUNCTION - Test form submission
  // ===========================================
  const debugSubmit = async () => {
    console.log("=".repeat(60));
    console.log("🐛 DEBUG: Testing form submission");
    console.log("=".repeat(60));
    
    // Test 1: Check form in DOM
    console.log("🧪 Test 1: Form DOM check");
    const formElement = document.querySelector('form');
    if (!formElement) {
      console.log("❌ CRITICAL: No form found in DOM!");
      alert("No form found in DOM!");
      return;
    }
    console.log("✅ Form found in DOM");
    
    // Test 2: Check submit button
    const submitBtn = formElement.querySelector('button[type="submit"]');
    if (!submitBtn) {
      console.log("❌ CRITICAL: No submit button found!");
      alert("No submit button found!");
      return;
    }
    console.log("✅ Submit button found");
    console.log("  - disabled:", submitBtn.disabled);
    console.log("  - text:", submitBtn.textContent);
    
    // Test 3: Simulate button click
    console.log("🧪 Test 3: Simulating button click");
    submitBtn.click();
    console.log("✅ Button click simulated");
    
    // Test 4: Direct API call
    console.log("🧪 Test 4: Direct API call (bypassing form)");
    const token = localStorage.getItem("token");
    if (!token) {
      console.log("❌ No token found");
      alert("Please login first");
      return;
    }
    
    try {
      const testData = {
        username: "debug_" + Date.now().toString().slice(-4),
        bio: "Debug test " + new Date().toLocaleTimeString()
      };
      
      console.log("📤 Sending test data:", testData);
      
      const response = await fetch('https://szeconnect.onrender.com/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(testData)
      });
      
      console.log("📥 Response status:", response.status);
      const data = await response.json();
      console.log("📥 Response data:", data);
      
      if (response.ok) {
        alert("✅ Debug test successful! Check console for details.");
      } else {
        alert(`❌ Debug test failed: ${data.message}`);
      }
    } catch (error) {
      console.error("❌ Debug API call failed:", error);
      alert(`Debug failed: ${error.message}`);
    }
    
    console.log("=".repeat(60));
    console.log("🐛 DEBUG COMPLETE");
    console.log("=".repeat(60));
  };

  // ===========================================
  // SIMPLE TEST: Check if button works
  // ===========================================
  const testButtonClick = () => {
    console.log("🟡 TEST BUTTON CLICKED!");
    alert("Test button works! Now try the save button.");
  };

  // Handle cancel/back
  const handleBack = () => {
    const hasChanges = 
      form.username.trim() !== "" ||
      form.bio.trim() !== "" ||
      form.password.trim() !== "" ||
      selectedFile !== null ||
      form.interests.length > 0;
    
    if (hasChanges && !window.confirm(
      lang === "hu" 
        ? "Vannak nem mentett változások. Biztosan elhagyod az oldalt?"
        : "You have unsaved changes. Are you sure you want to leave?"
    )) {
      return;
    }
    navigate("/profile");
  };

  // Language text
  const t = {
    title: lang === "hu" ? "Profil szerkesztése" : "Edit Profile",
    back: lang === "hu" ? "Vissza" : "Back",
    username: lang === "hu" ? "Felhasználónév" : "Username",
    usernamePlaceholder: lang === "hu" ? "Új felhasználónév" : "New username",
    bio: lang === "hu" ? "Bio" : "Bio",
    bioPlaceholder: lang === "hu" ? "Írd le magad röviden..." : "Tell us about yourself...",
    photo: lang === "hu" ? "Profilkép" : "Profile Picture",
    changePhoto: lang === "hu" ? "Kép módosítása" : "Change Photo",
    removePhoto: lang === "hu" ? "Kép eltávolítása" : "Remove Photo",
    interests: lang === "hu" ? "Érdeklődések" : "Interests",
    add: lang === "hu" ? "Hozzáadás" : "Add",
    interestPlaceholder: lang === "hu" ? "Új érdeklődés..." : "Add interest...",
    password: lang === "hu" ? "Új jelszó" : "New Password",
    passwordHint: lang === "hu" ? "Hagyja üresen, ha nem akarja módosítani" : "Leave empty to keep current",
    save: lang === "hu" ? "Változások mentése" : "Save Changes",
    saving: lang === "hu" ? "Mentés..." : "Saving...",
    loading: lang === "hu" ? "Betöltés..." : "Loading...",
    cancel: lang === "hu" ? "Mégse" : "Cancel",
    noChanges: lang === "hu" ? "Nincsenek változtatások" : "No changes made",
    debug: lang === "hu" ? "Hibakeresés" : "Debug"
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#1F3351]">{t.loading}</div>;

  return (
    <div className="min-h-screen bg-[#FFF6F2]">
      {/* Header */}
      <header className="bg-[#1F3351] text-white">
        <div className="mx-auto max-w-6xl px-4 py-5 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold">{t.title}</h1>
          <div className="flex items-center gap-3">
            <Link to="/info" className="w-10 h-10 inline-flex items-center justify-center rounded-full border-2 border-white/60 hover:bg-white/10 text-xl italic font-serif">i</Link>
            <button 
              onClick={handleBack}
              className="rounded-lg border border-white/30 bg-[#E1860E] text-white px-4 py-1.5 text-sm font-medium hover:bg-[#cf760c] transition"
            >
              {t.back}
            </button>
            <button 
              onClick={() => setLang(lang === "hu" ? "en" : "hu")} 
              className="rounded-lg border border-white/30 bg-white/80 backdrop-blur px-3 py-1.5 text-sm font-medium text-[#1F3351] hover:bg-white"
            >
              {lang === "hu" ? "EN" : "HU"}
            </button>
          </div>
        </div>
        <div className="h-3 bg-[#E1860E]" />
      </header>

      {/* Form */}
      <main className="mx-auto max-w-2xl px-4 py-10">
        {/* =========================================== */}
        {/* DEBUG BUTTONS - ADD THESE TEMPORARILY */}
        {/* =========================================== */}
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
          <h3 className="font-bold text-yellow-800 mb-2">🐛 Debug Tools</h3>
          <div className="flex flex-wrap gap-2">
            <button 
              type="button"
              onClick={testButtonClick}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Button Click
            </button>
            <button 
              type="button"
              onClick={debugSubmit}
              className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
            >
              Debug Form Submit
            </button>
            <button 
              type="button"
              onClick={() => {
                console.log("🔄 Forcing form submit via JS");
                const form = document.querySelector('form');
                if (form) {
                  const submitEvent = new Event('submit', { cancelable: true, bubbles: true });
                  form.dispatchEvent(submitEvent);
                }
              }}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Force Submit Event
            </button>
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            Open browser console (F12) to see debug logs
          </p>
        </div>

        <form 
          onSubmit={handleSubmit} 
          noValidate // Prevent browser validation
          className="space-y-6 rounded-2xl border-2 border-[#1F3351] bg-[#EDF5FA] p-6 shadow-md"
          id="profile-edit-form"
        >
          
          {/* Profile Picture Upload Section */}
          <div className="flex flex-col items-center gap-4 pb-4 border-b border-[#1F3351]/10">
            <div className="w-24 h-24 rounded-full border-2 border-[#1F3351] overflow-hidden bg-white shadow-sm relative">
              {previewImage ? (
                <img 
                  src={previewImage} 
                  alt="Profile Preview" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error("Failed to load preview image");
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">👤</div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden" 
                id="profile-image-input"
              />
              
              <button 
                type="button"
                onClick={() => {
                  console.log("📸 File input button clicked");
                  fileInputRef.current?.click();
                }}
                className="text-sm font-semibold text-[#E1860E] hover:underline px-3 py-1 rounded border border-[#E1860E] hover:bg-[#E1860E]/10"
              >
                📷 {t.changePhoto}
              </button>
              
              {previewImage && previewImage !== currentProfileImage && (
                <button 
                  type="button"
                  onClick={() => {
                    console.log("🗑️ Removing selected file");
                    setSelectedFile(null);
                    setPreviewImage(currentProfileImage);
                  }}
                  className="text-sm font-semibold text-red-600 hover:underline px-3 py-1 rounded border border-red-600 hover:bg-red-50"
                >
                  ✕ {t.removePhoto}
                </button>
              )}
            </div>
            
            {selectedFile && (
              <p className="text-xs text-[#1F3351]/60 text-center">
                {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-[#1F3351] font-bold mb-2">
              {t.username}
              <span className="text-sm font-normal text-[#1F3351]/60 ml-2">
                {lang === "hu" ? "(minimum 3 karakter)" : "(minimum 3 characters)"}
              </span>
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder={t.usernamePlaceholder}
              className="w-full rounded-lg border border-[#1F3351]/40 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E1860E] bg-white"
              minLength="3"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-[#1F3351] font-bold mb-2">{t.bio}</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder={t.bioPlaceholder}
              rows="4"
              className="w-full rounded-lg border border-[#1F3351]/40 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E1860E] bg-white resize-none"
              maxLength="500"
            />
            <div className="text-right text-sm text-[#1F3351]/60 mt-1">
              {form.bio.length}/500
            </div>
          </div>

          {/* Interests - Note: These are UI-only for now as DB support is pending */}
          <div>
            <label className="block text-[#1F3351] font-bold mb-2">{t.interests}</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder={t.interestPlaceholder}
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
                className="flex-1 rounded-lg border border-[#1F3351]/40 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E1860E] bg-white"
              />
              <button
                type="button"
                onClick={() => {
                  console.log("➕ Adding interest:", newInterest);
                  handleAddInterest();
                }}
                className="rounded-lg bg-[#E1860E] text-white px-4 py-2 font-medium hover:bg-[#cf760c] disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!newInterest.trim()}
              >
                {t.add}
              </button>
            </div>
            <div className="flex flex-wrap gap-2 min-h-8">
              {form.interests.length > 0 ? (
                form.interests.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-2 rounded-full bg-[#1F3351] text-white px-3 py-1 text-sm shadow">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => {
                        console.log("➖ Removing interest:", tag);
                        handleRemoveInterest(tag);
                      }} 
                      className="text-white/80 hover:text-red-300 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-[#1F3351]/60 italic text-sm">
                  {lang === "hu" ? "Még nincsenek érdeklődések hozzáadva" : "No interests added yet"}
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[#1F3351] font-bold mb-2">
              {t.password}
              <span className="text-sm font-normal text-[#1F3351]/60 ml-2">
                {lang === "hu" ? "(minimum 6 karakter)" : "(minimum 6 characters)"}
              </span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={t.passwordHint}
              className="w-full rounded-lg border border-[#1F3351]/40 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E1860E] bg-white"
              minLength="6"
            />
          </div>

          {/* Submit & Cancel Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-[#1F3351]/10">
            <button
              type="button"
              onClick={() => {
                console.log("↩️ Cancel button clicked");
                handleBack();
              }}
              className="rounded-lg border-2 border-[#1F3351] text-[#1F3351] font-semibold px-6 py-2 hover:bg-[#1F3351]/5 transition"
            >
              {t.cancel}
            </button>
            
            <button
              type="submit"
              id="save-profile-button"
              // TEMPORARILY REMOVE DISABLED CONDITION FOR DEBUGGING
              // disabled={submitting || (
              //   !form.username.trim() && 
              //   !form.bio.trim() && 
              //   !form.password.trim() && 
              //   !selectedFile
              // )}
              onClick={() => console.log("💾 Save button clicked directly")}
              className="rounded-xl bg-[#E1860E] text-white font-semibold px-6 py-2 shadow hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition min-w-32"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t.saving}
                </span>
              ) : t.save}
            </button>
          </div>
          
          {/* Debug info */}
          <div className="text-xs text-[#1F3351]/40 pt-2 border-t border-[#1F3351]/10">
            <div className="flex justify-between">
              <span>Form Status:</span>
              <span>
                {form.username.trim() ? "Username ✓ " : ""}
                {form.bio.trim() ? "Bio ✓ " : ""}
                {form.password.trim() ? "Password ✓ " : ""}
                {selectedFile ? "Image ✓ " : ""}
                {(!form.username.trim() && !form.bio.trim() && !form.password.trim() && !selectedFile) ? "No changes" : ""}
              </span>
            </div>
            <div className="mt-1">
              <span>Submit Status: </span>
              <span className={submitting ? "text-orange-500" : "text-green-500"}>
                {submitting ? "Submitting..." : "Ready"}
              </span>
            </div>
          </div>
        </form>
        
        {/* Debug instructions */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-bold text-blue-800 mb-2">🔧 Debug Instructions</h4>
          <ol className="text-sm text-blue-700 list-decimal pl-5 space-y-1">
            <li>Open browser console (F12 → Console tab)</li>
            <li>Clear console (Ctrl+L)</li>
            <li>Click "Test Button Click" - should see message</li>
            <li>Click "Save Changes" button - check if logs appear</li>
            <li>If no logs, click "Debug Form Submit"</li>
            <li>Check Network tab for any requests</li>
          </ol>
        </div>
      </main>
    </div>
  );
}
