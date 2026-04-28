import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import BackendWakeupToast from './components/BackendWakeupToast';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import MarketplaceDetail from './pages/MarketplaceDetail';
import Events from './pages/Events';
import EventDetail from './pages/EventDetail';
import LostFound from './pages/LostFound';
import LostFoundDetail from './pages/LostFoundDetail';
import PostItem from './pages/PostItem';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Navbar/>
                <Routes>
                    <Route path="/" element={<Landing/>}/>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route path="/marketplace" element={<Marketplace/>}/>
                    <Route path="/marketplace/:id" element={<MarketplaceDetail/>}/>
                    <Route path="/events" element={<Events/>}/>
                    <Route path="/events/:id" element={<EventDetail/>}/>
                    <Route path="/lost-found" element={<LostFound/>}/>
                    <Route path="/lost-found/:id" element={<LostFoundDetail/>}/>

                    <Route element={<ProtectedRoute/>}>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="/post" element={<PostItem/>}/>
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>

                {/* Render free-tier wakeup notifier — fires once per session */}
                <BackendWakeupToast/>
            </Router>
        </AuthProvider>
    );
}

export default App;
