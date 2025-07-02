import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './hooks/AuthProvider';
import AppRouter from './router';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-app-background flex">
          {/* Sidebar/Navbar */}
          <AppRouter />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
