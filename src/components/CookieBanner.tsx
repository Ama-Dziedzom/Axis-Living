'use client';

import { useEffect, useState } from 'react';

export default function CookieBanner() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (!localStorage.getItem('cookie-consent')) {
            setVisible(true);
        }
    }, []);

    const respond = (choice: 'accepted' | 'declined') => {
        localStorage.setItem('cookie-consent', choice);
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
            <div className="max-w-4xl mx-auto bg-[#2F402C] text-white rounded-2xl shadow-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <p className="text-sm leading-relaxed flex-1 text-white/90">
                    We use cookies to improve your experience on our site. By continuing, you agree to our use of cookies.{' '}
                    <a
                        href="/privacy"
                        className="underline underline-offset-2 text-white hover:text-white/70 transition-colors"
                    >
                        Learn more
                    </a>
                </p>
                <div className="flex gap-3 shrink-0">
                    <button
                        onClick={() => respond('declined')}
                        className="px-4 py-2 text-sm rounded-full border border-white/30 text-white/80 hover:border-white/60 hover:text-white transition-colors cursor-pointer"
                    >
                        Decline
                    </button>
                    <button
                        onClick={() => respond('accepted')}
                        className="px-5 py-2 text-sm rounded-full bg-white text-[#2F402C] font-medium hover:bg-white/90 transition-colors cursor-pointer"
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}
