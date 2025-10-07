"use client";
import { Truck, Phone, Mail, MapPin } from "lucide-react";

export default function InfoCat() {
  const infoItems = [
    {
      icon: <Truck size={40} className="text-sky-900 mb-2" />,
      title: "DELIVERY THROUGHOUT QLD",
      description: "Delivery from Townsville to Cape, Enquire today",
    },
    {
      icon: <Phone size={40} className="text-sky-900 mb-2" />,
      title: "GIVE US A CALL",
      description: "+61 0427-433-001",
    },
    {
      icon: <Mail size={40} className="text-sky-900 mb-2" />,
      title: "HAVE QUESTIONS?",
      description: (
        <a
          href="mailto:will@usavecommercial.com"
          className="text-sky-800 hover:underline"
        >
          will@usavecommercial.com
        </a>
      ),
    },
    {
      icon: <MapPin size={40} className="text-sky-900 mb-2" />,
      title: "LOCATIONS",
      description: "Portdouglas & Portsmith, Cairns, 4870",
    },
  ];

  return (
    <section className="bg-sky-50 py-10 h-[300px]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 text-center items-center justify-center h-full px-4">
        {infoItems.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            {item.icon}
            <h3 className="text-sm font-semibold tracking-wide text-sky-900 uppercase mb-1">
              {item.title}
            </h3>
            <p className="text-gray-700 text-sm">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
