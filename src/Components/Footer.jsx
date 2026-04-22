import React, { useState } from 'react'
import { FiArrowRight } from 'react-icons/fi'
import Logo from './Logo'

export default function Footer() {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    message: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Enquiry:', formData)
    alert('Thank you. We will contact you shortly.')
    setFormData({ fullname: '', email: '', phone: '', message: '' })
  }

  return (
    <footer className="bg-zinc-900 border-t border-white/5 pt-20 pb-10 font-['Poppins']">
      <div className="max-w-[1240px] mx-auto px-6 lg:px-20">
        
        <div className="flex flex-col lg:flex-row justify-between gap-16 mb-20">
          
          {/* Simple Branding */}
          <div className="lg:w-1/3">
            <Logo size="md" className="mb-4" />
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">
              Institutional-grade assets and refined portfolio management for the modern investor.
            </p>
          </div>

          {/* Simple Enquiry Form */}
          <div className="lg:w-1/2">
            <h3 className="text-xl font-bold text-white mb-6">Enquiry form</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input 
                required
                type="text" 
                placeholder="Full Name"
                value={formData.fullname}
                onChange={(e) => setFormData({...formData, fullname: e.target.value})}
                className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ccff00]/30 outline-none transition-all"
              />
              <input 
                required
                type="email" 
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ccff00]/30 outline-none transition-all"
              />
              <input 
                required
                type="tel" 
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ccff00]/30 outline-none transition-all md:col-span-2"
              />
              <textarea 
                required
                rows="3"
                placeholder="Message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-[#ccff00]/30 outline-none transition-all md:col-span-2 resize-none"
              ></textarea>
              
              <button 
                type="submit" 
                className="md:col-span-2 group flex items-center justify-center gap-2 py-4 bg-[#ccff00] text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all duration-300 active:scale-95"
              >
                Submit Enquiry <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>

        {/* Minimal Bottom Bar */}
        <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest">
            © 2026 MED HEALTH INVEST. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] text-zinc-600 hover:text-white uppercase tracking-widest transition-colors font-medium">Privacy Policy</a>
            <a href="#" className="text-[10px] text-zinc-600 hover:text-white uppercase tracking-widest transition-colors font-medium">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
