"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { Bell, X, Check } from "lucide-react";

type User = {
  email: string;
  role: string;
};

type Notification = {
  id: string;
  message: string;
  created_at: string;
};

export default function NotificationBell() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const shouldHide = pathname === "/login" || pathname === "/";

  const fetchNotifications = useCallback(async (role: string, email: string) => {
    try {
      const res = await fetch(`/api/v1/exams/notifications?role=${encodeURIComponent(role)}&email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  }, []);

  const fetchUserAndNotifications = useCallback(async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      // Get User
      if (!user) {
        const userRes = await fetch("/api/v1/auth/me", {
          headers: {
          "ngrok-skip-browser-warning": "69420", "Authorization": `Bearer ${token}` }
        });
        if (userRes.ok) {
          const userData: User = await userRes.json();
          setUser(userData);
          fetchNotifications(userData.role, userData.email);
        }
      } else {
        fetchNotifications(user.role, user.email);
      }
    } catch (error) {
      console.error("Notif Error:", error);
    }
  }, [fetchNotifications, user]);

  const clearNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/v1/exams/notifications/clear?role=${encodeURIComponent(user.role)}&email=${encodeURIComponent(user.email)}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setNotifications([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Failed to clear notifications", error);
    }
  };

  useEffect(() => {
    if (shouldHide) return;

    const initialFetch = setTimeout(fetchUserAndNotifications, 0);
    const interval = setInterval(fetchUserAndNotifications, 10000); // Polling every 10s
    return () => {
      clearTimeout(initialFetch);
      clearInterval(interval);
    };
  }, [fetchUserAndNotifications, shouldHide]);

  // Click outside listener
  useEffect(() => {
    if (shouldHide) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [shouldHide]);

  // Do not render on login/home page, after all hooks have been called.
  if (shouldHide) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end print:hidden" ref={popupRef}>
      
      {/* Popup Menu */}
      {isOpen && (
        <div className="mb-4 w-80 bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(10,25,47,1)] overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-[#0a192f] text-white px-4 py-3 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-4 h-4" /> Notifications
            </h3>
            <button onClick={() => setIsOpen(false)} className="hover:text-red-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 font-medium text-sm flex flex-col items-center">
                <Check className="w-8 h-8 text-green-500 mb-2 opacity-50" />
                You&apos;re all caught up!
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map((n) => (
                  <li key={n.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <p className="text-sm font-semibold text-gray-800">{n.message}</p>
                    <span className="text-xs text-gray-500 font-medium block mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 border-t border-gray-200">
              <button 
                onClick={clearNotifications}
                className="w-full text-center text-xs font-bold text-[#dc2626] uppercase py-2 hover:bg-red-50 transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}

      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-white border-2 border-black rounded-none shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] flex items-center justify-center hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(220,38,38,1)] transition-all relative group"
      >
        <Bell className="w-6 h-6 text-black group-hover:animate-pulse delay-75" />
        {notifications.length > 0 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#dc2626] border-2 border-black text-white text-xs font-bold flex items-center justify-center shadow-sm">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>
    </div>
  );
}
