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

//OLDER
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// import InterestsPage from "./pages/InterestsPage";
// import FaqPrivacyPage from "./pages/FaqPrivacyPage";
// import SearchResultsPage from "./pages/SearchResultsPage";
// import UserProfilePage from "./pages/UserProfilePage";
// import GroupPage from "./pages/GroupPage";
// import HomeFeedPage from "./pages/HomeFeedPage";
// import PostComposerPage from "./pages/PostComposerPage";
// import PostDetailsPage from "./pages/PostDetailsPage";
// import CreateGroupPage from "./pages/CreateGroupPage";
// import ForgotPasswordPage from "./pages/ForgotPasswordPage";
// // import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import UsersTestPage from "./pages/UsersTestPage";

// function App() {
//   return (
//     <BrowserRouter>
//       <Routes>
//         <Route path="/login" element={<LoginPage />} />
//         <Route path="/register" element={<RegisterPage />} />
//         <Route path="/interests" element={<InterestsPage />} />
//         <Route path="*" element={<LoginPage />} />
//         <Route path="/info" element={<FaqPrivacyPage />} />
//         <Route path="/search" element={<SearchResultsPage />} />
//         <Route path="/users/:userId" element={<UserProfilePage />} />
//         <Route path="/profile" element={<UserProfilePage />} /> {/* current user */}
//         <Route path="/groups/:groupId" element={<GroupPage />} />
//         <Route path="/home" element={<HomeFeedPage />} />
//         <Route path="/post/new" element={<PostComposerPage />} />
//         <Route path="/posts/:postId" element={<PostDetailsPage />} />
//         <Route path="/groups/new" element={<CreateGroupPage />} />
//         <Route path="/forgot" element={<ForgotPasswordPage />} />
//         <Route path="/dev/users" element={<UsersTestPage />} /> 

//       </Routes>
//     </BrowserRouter>
//   );
// }

// export default App;

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import CreateGroupPage from "./pages/CreateGroupPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UsersTestPage from "./pages/UsersTestPage";

// simple guard for pages that need a token
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* make "/" show the login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/interests" element={<InterestsPage />} />
        <Route path="/info" element={<FaqPrivacyPage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/users/:userId" element={<UserProfilePage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/groups/:groupId" element={<GroupPage />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomeFeedPage />
            </ProtectedRoute>
          }
        />
        <Route path="/post/new" element={<ProtectedRoute><PostComposerPage /></ProtectedRoute>} />
        <Route path="/posts/:postId" element={<PostDetailsPage />} />
        <Route path="/groups/new" element={<ProtectedRoute><CreateGroupPage /></ProtectedRoute>} />
        <Route path="/forgot" element={<ForgotPasswordPage />} />
        <Route path="/dev/users" element={<UsersTestPage />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


