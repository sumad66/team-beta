import React from 'react';

interface TutorProfileCardProps {
  name: string;
  subject: string;
  experience: number;
  rating: number;
  imageUrl?: string;
}

const TutorProfileCard: React.FC<TutorProfileCardProps> = ({
  name,
  subject,
  experience,
  rating,
  imageUrl
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-sm mx-auto">
      <div className="flex items-center space-x-4">
        {imageUrl && (
          <img
            src={imageUrl}
            alt={name}
            className="w-16 h-16 rounded-full object-cover"
          />
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
          <p className="text-gray-600">{subject}</p>
        </div>
      </div>
      <div className="mt-4">
        <p className="text-gray-700">
          <span className="font-medium">Experience:</span> {experience} years
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Rating:</span> {rating}/5
        </p>
      </div>
    </div>
  );
};

export default TutorProfileCard;
