// import React from "react";
// import LoginPage from "./pages/LoginPage";

// function App() {
//   return <LoginPage />;
// }

// export default App;


// import RegisterPage from "./pages/RegisterPage";
// export default function App() { return <RegisterPage />; }

// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";



// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         {/* Login page at /login */}
//         <Route path="/login" element={<LoginPage />} />

//         {/* Register page at /register */}
//         <Route path="/register" element={<RegisterPage />} />

//         {/* Default route: if nothing matches, go to login */}
//         <Route path="*" element={<LoginPage />} />
//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import InterestsPage from "./pages/InterestsPage";
import FaqPrivacyPage from "./pages/FaqPrivacyPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import UserProfilePage from "./pages/UserProfilePage";
import GroupPage from "./pages/GroupPage";
import HomeFeedPage from "./pages/HomeFeedPage";
import PostComposerPage from "./pages/PostComposerPage";
import PostDetailsPage from "./pages/PostDetailsPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/interests" element={<InterestsPage />} />
        <Route path="*" element={<LoginPage />} />
        <Route path="/info" element={<FaqPrivacyPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/users/:userId" element={<UserProfilePage />} />
        <Route path="/profile" element={<UserProfilePage />} /> {/* current user */}
        <Route path="/groups/:groupId" element={<GroupPage />} />
        <Route path="/home" element={<HomeFeedPage />} />
        <Route path="/post/new" element={<PostComposerPage />} />
        <Route path="/posts/:postId" element={<PostDetailsPage />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

