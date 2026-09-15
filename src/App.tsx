import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Subjects from './pages/Subjects';
import SubjectDetail from './pages/SubjectDetail';
import Practice from './pages/Practice';
import Contribute from './pages/Contribute';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import Moderate from './pages/Moderate';
import Auth from './pages/Auth';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="subjects" element={<Subjects />} />
            <Route path="subjects/:slug" element={<SubjectDetail />} />
            <Route path="practice" element={<Practice />} />
            <Route path="contribute" element={<Contribute />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="moderate" element={<Moderate />} />
            <Route path="auth" element={<Auth />} />
            <Route path="reset-password" element={<ResetPassword />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
