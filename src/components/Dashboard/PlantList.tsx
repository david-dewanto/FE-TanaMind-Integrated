import React, { useState } from 'react';
import { Plant } from '../../types';
import PlantCard from './PlantCard';
import { Search, Filter, X } from 'lucide-react';

interface PlantListProps {
  plants: Plant[];
  onPlantClick: (plant: Plant) => void;
  onEdit?: (plant: Plant) => void;
  onDelete?: (plant: Plant) => void;
}

const PlantList: React.FC<PlantListProps> = ({ plants, onPlantClick, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  
  // Filter options
  const filterOptions = [
    'All',
    'Needs Water',
    'Needs Attention',
    'Auto-Watering',
    'Indoor',
    'Outdoor'
  ];
  
  // Filter plants based on search term and selected filter
  const filteredPlants = plants.filter(plant => {
    // Search term filter
    const matchesSearch = searchTerm === '' || 
      plant.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.actualName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plant.species.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    if (!matchesSearch) return false;
    
    if (!selectedFilter || selectedFilter === 'All') return true;
    
    switch (selectedFilter) {
      case 'Needs Water':
        const nextWatering = new Date(plant.tracking.nextWateringDate);
        return nextWatering <= new Date();
      case 'Needs Attention':
        return plant.iotIntegration.healthStatus === 'poor' || 
               plant.iotIntegration.healthStatus === 'critical';
      case 'Auto-Watering':
        return plant.iotIntegration.autoWateringEnabled;
      case 'Indoor':
        return plant.category === 'Indoor';
      case 'Outdoor':
        return plant.category === 'Outdoor';
      default:
        return true;
    }
  });
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleFilterSelect = (filter: string) => {
    setSelectedFilter(filter === 'All' ? null : filter);
    setIsFilterMenuOpen(false);
  };
  
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  
  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
  };

  return (
    <div className="mt-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#056526]">
          {selectedFilter ? selectedFilter : 'All Plants'} 
          <span className="text-gray-500 text-base font-normal ml-2">({filteredPlants.length})</span>
        </h2>
        
        <div className="flex mt-2 sm:mt-0">
          <div className="relative mr-2">
            <input
              type="text"
              placeholder="Search plants..."
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#39B54A] focus:border-transparent"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="relative">
            <button 
              onClick={toggleFilterMenu}
              className="flex items-center bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Filter size={18} className="mr-1" />
              <span>Filter</span>
            </button>
            
            {isFilterMenuOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-white rounded-md shadow-lg py-1 z-10">
                {filterOptions.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => handleFilterSelect(filter)}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      (filter === 'All' && !selectedFilter) || filter === selectedFilter
                        ? 'bg-[#DFF3E2] text-[#0B9444]'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {filteredPlants.length === 0 ? (
        <div className="bg-gray-50 p-6 rounded-lg text-center">
          <p className="text-gray-600">
            {searchTerm || selectedFilter
              ? "No plants match your search criteria."
              : "No plants in your collection yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlants.map((plant) => (
            <PlantCard 
              key={plant.id} 
              plant={plant}
              onClick={() => onPlantClick(plant)}
              onEdit={onEdit ? () => onEdit(plant) : undefined}
              onDelete={onDelete ? () => onDelete(plant) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlantList;