import { Outlet } from "react-router-dom";
import Sidebar from "@/layout/Sidebar";
import Navbar from "@/layout/Navbar";
import { useState } from "react";

function Dashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return ( 
        <div className="flex min-h-screen relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-[174px]">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="pt-16 px-4 md:px-6 lg:px-8">
             <Outlet/>
          </main>
        </div>
      </div>
     );
}

export default Dashboard;