import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { NUMERIC_FILTER_FIELDS, BOOLEAN_FILTER_FIELDS, CATEGORICAL_FILTER_FIELDS, SKILLS_FILTER_OPTIONS } from '../utils/dataUtils';

const FilterPanel = ({ 
  onNumericFiltersChange, 
  onBooleanFiltersChange,
  onCategoricalFiltersChange,
  onSkillsFiltersChange,
  numericFilters = {}, 
  booleanFilters = {},
  categoricalFilters = {},
  skillsFilters = {},
  totalPlayers = 0,
  filteredPlayers = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Stati locali per i filtri numerici
  const [localNumericFilters, setLocalNumericFilters] = useState(() => {
    const initial = {};
    NUMERIC_FILTER_FIELDS.forEach(field => {
      initial[field.key] = numericFilters[field.key] || { 
        min: field.min, 
        max: field.max 
      };
    });
    return initial;
  });

  // Stati locali per i filtri booleani
  const [localBooleanFilters, setLocalBooleanFilters] = useState(() => {
    const initial = {};
    BOOLEAN_FILTER_FIELDS.forEach(field => {
      initial[field.key] = booleanFilters[field.key];
    });
    return initial;
  });

  // Stati locali per i filtri categorici
  const [localCategoricalFilters, setLocalCategoricalFilters] = useState(() => {
    const initial = {};
    CATEGORICAL_FILTER_FIELDS.forEach(field => {
      initial[field.key] = categoricalFilters[field.key];
    });
    return initial;
  });

  // Stati locali per i filtri skills
  const [localSkillsFilters, setLocalSkillsFilters] = useState(() => {
    const initial = {};
    SKILLS_FILTER_OPTIONS.forEach(skill => {
      initial[skill.key] = skillsFilters[skill.key] || false;
    });
    return initial;
  });

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleNumericFilterChange = (fieldKey, type, value) => {
    const newFilters = {
      ...localNumericFilters,
      [fieldKey]: {
        ...localNumericFilters[fieldKey],
        [type]: parseFloat(value)
      }
    };
    setLocalNumericFilters(newFilters);
    onNumericFiltersChange(newFilters);
  };

  const handleBooleanFilterChange = (fieldKey, value) => {
    const newFilters = {
      ...localBooleanFilters,
      [fieldKey]: value
    };
    setLocalBooleanFilters(newFilters);
    onBooleanFiltersChange(newFilters);
  };

  const handleCategoricalFilterChange = (fieldKey, value) => {
    const newFilters = {
      ...localCategoricalFilters,
      [fieldKey]: value
    };
    setLocalCategoricalFilters(newFilters);
    onCategoricalFiltersChange(newFilters);
  };

  const handleSkillsFilterChange = (skillKey, isActive) => {
    const newFilters = {
      ...localSkillsFilters,
      [skillKey]: isActive
    };
    setLocalSkillsFilters(newFilters);
    onSkillsFiltersChange(newFilters);
  };

  const handleResetFilters = () => {
    // Reset filtri numerici ai valori di default
    const resetNumeric = {};
    NUMERIC_FILTER_FIELDS.forEach(field => {
      resetNumeric[field.key] = { min: field.min, max: field.max };
    });
    
    // Reset filtri booleani
    const resetBoolean = {};
    BOOLEAN_FILTER_FIELDS.forEach(field => {
      resetBoolean[field.key] = undefined;
    });

    // Reset filtri categorici
    const resetCategorical = {};
    CATEGORICAL_FILTER_FIELDS.forEach(field => {
      resetCategorical[field.key] = undefined;
    });

    // Reset filtri skills
    const resetSkills = {};
    SKILLS_FILTER_OPTIONS.forEach(skill => {
      resetSkills[skill.key] = false;
    });

    setLocalNumericFilters(resetNumeric);
    setLocalBooleanFilters(resetBoolean);
    setLocalCategoricalFilters(resetCategorical);
    setLocalSkillsFilters(resetSkills);
    onNumericFiltersChange(resetNumeric);
    onBooleanFiltersChange(resetBoolean);
    onCategoricalFiltersChange(resetCategorical);
    onSkillsFiltersChange(resetSkills);
  };

  // Controlla se ci sono filtri attivi
  const hasActiveFilters = () => {
    // Controlla filtri numerici
    const hasNumericFilters = NUMERIC_FILTER_FIELDS.some(field => {
      const filter = localNumericFilters[field.key];
      return filter && (filter.min !== field.min || filter.max !== field.max);
    });
    
    // Controlla filtri booleani
    const hasBooleanFilters = BOOLEAN_FILTER_FIELDS.some(field => {
      return localBooleanFilters[field.key] !== undefined;
    });
    
    // Controlla filtri categorici
    const hasCategoricalFilters = CATEGORICAL_FILTER_FIELDS.some(field => {
      return localCategoricalFilters[field.key] !== undefined;
    });
    
    // Controlla filtri skills
    const hasSkillsFilters = SKILLS_FILTER_OPTIONS.some(skill => {
      return localSkillsFilters[skill.key] === true;
    });
    
    return hasNumericFilters || hasBooleanFilters || hasCategoricalFilters || hasSkillsFilters;
  };

  // Stili
  const panelStyle = {
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    marginBottom: '1.5rem',
    transition: 'all 0.3s ease'
  };

  const headerStyle = {
    padding: '1rem',
    borderBottom: isExpanded ? '1px solid #e5e7eb' : 'none',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    userSelect: 'none'
  };

  const titleStyle = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#1f2937',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  };

  const contentStyle = {
    padding: isExpanded ? '1.5rem' : '0',
    maxHeight: isExpanded ? '60vh' : '0', // Limita l'altezza a 60% del viewport
    overflow: isExpanded ? 'auto' : 'hidden', // Permette scroll quando espanso
    transition: 'all 0.3s ease'
  };

  const sectionStyle = {
    marginBottom: '2rem'
  };

  const sectionTitleStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '1rem',
    borderBottom: '1px solid #f3f4f6',
    paddingBottom: '0.5rem'
  };

  const filterRowStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px'
  };

  const labelStyle = {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#4b5563'
  };

  const inputStyle = {
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%'
  };

  const sliderStyle = {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    background: '#e5e7eb',
    outline: 'none',
    WebkitAppearance: 'none'
  };

  const checkboxRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '0.5rem'
  };

  const checkboxStyle = {
    width: '18px',
    height: '18px',
    accentColor: '#3b82f6'
  };

  const buttonStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: hasActiveFilters() ? '#ef4444' : '#6b7280',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s'
  };

  const statsStyle = {
    fontSize: '0.9rem',
    color: '#6b7280',
    fontStyle: 'italic'
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle} onClick={handleToggleExpand}>
        <div style={titleStyle}>
          <span>🔍</span>
          Filtri Avanzati
          {hasActiveFilters() && (
            <span style={{
              backgroundColor: '#ef4444',
              color: 'white',
              fontSize: '0.7rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '10px',
              marginLeft: '0.5rem'
            }}>
              ATTIVI
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={statsStyle}>
            {filteredPlayers} di {totalPlayers} giocatori
          </span>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      <div style={contentStyle}>
        {/* Pulsante Reset */}
        <div style={{ marginBottom: '1.5rem', textAlign: 'right' }}>
          <button
            style={buttonStyle}
            onClick={handleResetFilters}
            disabled={!hasActiveFilters()}
          >
            <RotateCcw size={16} />
            Reset Filtri
          </button>
        </div>

        {/* Filtri Numerici */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Filtri Numerici (Range)</div>
          {NUMERIC_FILTER_FIELDS.map(field => {
            const filter = localNumericFilters[field.key];
            return (
              <div key={field.key} style={filterRowStyle}>
                <div style={labelStyle}>{field.label}</div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    style={{ ...inputStyle, width: '60px' }}
                    value={filter.min}
                    min={field.min}
                    max={field.max}
                    onChange={(e) => handleNumericFilterChange(field.key, 'min', e.target.value)}
                  />
                  <span style={{ color: '#6b7280' }}>-</span>
                  <input
                    type="number"
                    style={{ ...inputStyle, width: '60px' }}
                    value={filter.max}
                    min={field.min}
                    max={field.max}
                    onChange={(e) => handleNumericFilterChange(field.key, 'max', e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <input
                    type="range"
                    style={sliderStyle}
                    min={field.min}
                    max={field.max}
                    value={filter.min}
                    onChange={(e) => handleNumericFilterChange(field.key, 'min', e.target.value)}
                  />
                  <input
                    type="range"
                    style={sliderStyle}
                    min={field.min}
                    max={field.max}
                    value={filter.max}
                    onChange={(e) => handleNumericFilterChange(field.key, 'max', e.target.value)}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Filtri Booleani */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Filtri Categorici</div>
          {BOOLEAN_FILTER_FIELDS.map(field => {
            const filterValue = localBooleanFilters[field.key];
            return (
              <div key={field.key} style={checkboxRowStyle}>
                <span style={labelStyle}>{field.label}</span>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                    <input
                      type="radio"
                      name={field.key}
                      checked={filterValue === undefined}
                      onChange={() => handleBooleanFilterChange(field.key, undefined)}
                    />
                    Tutti
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                    <input
                      type="radio"
                      name={field.key}
                      checked={filterValue === true}
                      onChange={() => handleBooleanFilterChange(field.key, true)}
                    />
                    Sì
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                    <input
                      type="radio"
                      name={field.key}
                      checked={filterValue === false}
                      onChange={() => handleBooleanFilterChange(field.key, false)}
                    />
                    No
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {/* Filtri Categorici */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Filtri Categorici Avanzati</div>
          {CATEGORICAL_FILTER_FIELDS.map(field => {
            const filterValue = localCategoricalFilters[field.key];
            return (
              <div key={field.key} style={checkboxRowStyle}>
                <span style={labelStyle}>{field.label}</span>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                    <input
                      type="radio"
                      name={field.key}
                      checked={filterValue === undefined}
                      onChange={() => handleCategoricalFilterChange(field.key, undefined)}
                    />
                    Tutti
                  </label>
                  {field.categories.map(category => (
                    <label key={category.key} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                      <input
                        type="radio"
                        name={field.key}
                        checked={filterValue === category.key}
                        onChange={() => handleCategoricalFilterChange(field.key, category.key)}
                      />
                      {category.label}
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Filtri Skills */}
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Filtri per Skills</div>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '0.75rem' 
          }}>
            {SKILLS_FILTER_OPTIONS.map(skill => {
              const isActive = localSkillsFilters[skill.key];
              return (
                <label 
                  key={skill.key} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem', 
                    fontSize: '0.85rem',
                    padding: '0.5rem',
                    backgroundColor: isActive ? '#dbeafe' : '#f9fafb',
                    borderRadius: '6px',
                    border: isActive ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => handleSkillsFilterChange(skill.key, e.target.checked)}
                    style={{ marginRight: '0.25rem' }}
                  />
                  {skill.label}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;