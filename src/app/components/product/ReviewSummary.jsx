'use client';

import React from 'react';
import { Star } from 'lucide-react';

export default function ReviewSummary({ stats }) {
    const { averageRating, totalReviews, ratingBreakdown } = stats;

    const getPercentage = (count) => {
        if (!totalReviews) return 0;
        return (count / totalReviews) * 100;
    };

    const stars = [5, 4, 3, 2, 1];

    return (
        <div className="flex flex-col md:flex-row gap-8 items-start bg-gray-50 rounded-2xl p-6 sm:p-8 border border-gray-200">
            {/* Average Rating Section */}
            <div className="flex flex-col items-center justify-center text-center md:border-r border-gray-200 md:pr-12 md:min-w-[200px]">
                <div className="text-5xl font-bold text-[#0B4866] mb-2">
                    {averageRating.toFixed(1)}
                </div>
                <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            size={24}
                            className={i < Math.floor(averageRating) ? 'fill-current' : 'text-gray-300'}
                        />
                    ))}
                </div>
                <div className="text-gray-500 font-medium">
                    Based on {totalReviews} reviews
                </div>
            </div>

            {/* Rating Breakdown Section */}
            <div className="flex-1 w-full space-y-3">
                {stars.map((star) => {
                    const count = ratingBreakdown[star] || 0;
                    const percentage = getPercentage(count);

                    return (
                        <div key={star} className="flex items-center gap-4">
                            <div className="flex items-center gap-1 min-w-[50px]">
                                <span className="text-sm font-semibold text-gray-700">{star}</span>
                                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            </div>
                            <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <div className="text-sm text-gray-500 min-w-[40px] text-right">
                                {count}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
