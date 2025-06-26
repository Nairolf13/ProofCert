import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './hooks/AuthProvider';
import AppRouter from './router';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
          <AppRouter />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
