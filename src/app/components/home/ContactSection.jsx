"use client";
import { Mail, Phone, MapPin, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ContactSection() {
  const contactInfo = {
    address: {
      line1: "Port Douglas & Portsmith",
      line2: "Cairns, QLD 4870",
      region: "Far North Queensland"
    },
    email: "info@usavecommercial.com.au",
    phone: "+61 0427-433-001",
    hours: {
      weekdays: "Monday - Friday: 9:00 AM - 6:00 PM",
      saturday: "Saturday: 9:00 AM - 4:00 PM",
      sunday: "Sunday: Closed"
    }
  };

  return (
    <section className="w-full py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Have questions about our products or services? We're here to help you find the perfect furniture for your space.
          </p>
        </div>

        {/* Contact Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Address Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all duration-300 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-lg flex-shrink-0">
                <MapPin className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Business Address</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {contactInfo.address.line1}<br />
                  {contactInfo.address.line2}<br />
                  <span className="text-gray-400">{contactInfo.address.region}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Email Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all duration-300 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-lg flex-shrink-0">
                <Mail className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Email Us</h3>
                <a 
                  href={`mailto:${contactInfo.email}`}
                  className="text-gray-400 hover:text-white transition-colors text-sm break-all"
                >
                  {contactInfo.email}
                </a>
                <p className="text-gray-400 text-xs mt-1">We'll respond within 24 hours</p>
              </div>
            </div>
          </div>

          {/* Phone Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all duration-300 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-lg flex-shrink-0">
                <Phone className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Call Us</h3>
                <a 
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {contactInfo.phone}
                </a>
                <p className="text-gray-400 text-xs mt-1">Mon-Fri 9AM-6PM</p>
              </div>
            </div>
          </div>

          {/* Hours Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all duration-300 border border-white/20">
            <div className="flex items-start gap-4">
              <div className="bg-white/20 p-3 rounded-lg flex-shrink-0">
                <Clock className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Business Hours</h3>
                <div className="text-gray-400 text-xs leading-relaxed">
                  <p>{contactInfo.hours.weekdays}</p>
                  <p>{contactInfo.hours.saturday}</p>
                  <p>{contactInfo.hours.sunday}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Google Map Preview */}
        {/* NOTE: Replace the embed URL below with your actual Google Maps embed URL */}
        {/* To get your embed URL: Go to Google Maps > Search your location > Share > Embed a map > Copy the iframe src */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg overflow-hidden border border-white/20">
            <div className="aspect-video w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3749.1234567890!2d145.7654321!3d-16.8765432!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDUyJzM1LjYiUyAxNDXCsDQ1JzU1LjYiRQ!5e0!3m2!1sen!2sau!4v1234567890123!5m2!1sen!2sau"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
                title="Usave Commercial Location"
              />
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#0B4866] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Visit Contact Page
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}

