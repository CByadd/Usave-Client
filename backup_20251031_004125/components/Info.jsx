"use client";
import { Truck, Phone, HelpCircle, User } from "lucide-react";

const infoItems = [
  {
    icon: Truck,
    title: "PORT DOUGLAS LOCALS",
    desc: "Local with over a decade of experience servicing Cairns to Cape York.",
  },
  {
    icon: Phone,
    title: "5-STAR SERVICE",
    desc: "We handle all your Furniture, Bedding, and Electrical needs from start to finish.",
  },
  {
    icon: HelpCircle,
    title: "BEST PRICES",
    desc: "Explore high quality Domestic & Commercial products at the best prices.",
  },
  {
    icon: User,
    title: "NO FEE",
    desc: "No joining fee and instant savings with discounted business pricing.",
  },
];

export default function Info() {
  return (
    <section className="w-full py-12 bg-white">
      <div className=" mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center px-6">
        {infoItems.map((item, i) => (
          <div key={i} className="flex flex-col items-center justify-center space-y-3">
            <item.icon className="w-8 h-8 text-[#00446A]" />
            <h3 className="text-sm font-semibold tracking-wide text-[#00446A] uppercase">
              {item.title}
            </h3>
            <p className="text-sm text-[#00446A]/80 leading-relaxed max-w-[230px]">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
