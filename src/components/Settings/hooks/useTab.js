import { useState } from 'react';

export const useTab = (initialTab = 'subjects') => {
  const [activeTab, setActiveTab] = useState(initialTab);

  const changeTab = (tab) => {
    setActiveTab(tab);
  };

  return {
    activeTab,
    changeTab
  };
};

