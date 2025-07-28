import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SideNavigation, { NavigationItem } from '../SideNavigation';

// Mock icons for testing
const HomeIcon = () => <svg data-testid="home-icon" />;
const SettingsIcon = () => <svg data-testid="settings-icon" />;
const UserIcon = () => <svg data-testid="user-icon" />;

const mockNavigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    href: '/',
 