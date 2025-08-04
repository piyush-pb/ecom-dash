# 🛒 E-Commerce Analytics Dashboard

A modern, responsive e-commerce analytics dashboard built with React, TypeScript, and Tailwind CSS. This dashboard provides comprehensive insights into e-commerce performance with real-time data visualization, order management, customer analytics, and inventory tracking.

![Dashboard Preview](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3.0-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-4.4.0-646CFF?style=for-the-badge&logo=vite)

## ✨ Features

### 📊 **Dashboard Analytics**
- **Real-time KPIs**: Revenue, orders, conversion rates, and customer metrics
- **Interactive Charts**: Sales trends, customer growth, and performance indicators
- **Traffic Sources**: Marketing channel analysis and conversion tracking
- **Conversion Funnel**: Step-by-step customer journey analysis

### 📦 **Order Management**
- **Order Tracking**: Complete order lifecycle management
- **Bulk Operations**: Multi-select and bulk status updates
- **Search & Filter**: Advanced filtering by status, date, and customer
- **Export Functionality**: CSV/Excel export for order data

### 👥 **Customer Management**
- **Customer Profiles**: Detailed customer information and history
- **Behavior Analytics**: Customer segmentation and behavior patterns
- **Lifetime Value**: Customer value analysis and insights

### 📋 **Inventory Management**
- **Stock Tracking**: Real-time inventory levels and alerts
- **Low Stock Alerts**: Automated notifications for reordering
- **Product Analytics**: Performance metrics for individual products

### 🔔 **Smart Notifications**
- **Real-time Alerts**: Instant notifications for important events
- **Customizable**: Configurable notification preferences
- **Action Items**: Direct links to relevant sections

### 📈 **Advanced Analytics**
- **Dynamic Metrics**: Switch between revenue, orders, customers, and conversion
- **Date Range Selection**: Flexible time period analysis
- **Export Reports**: Comprehensive data export capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/piyush-pb/ecom-dash.git
   cd ecom-dash
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and development server

### Data & State Management
- **React Query** - Server state management and caching
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Visualization & UI
- **Recharts** - Data visualization library
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications

### Analytics & Tracking
- **PostHog** - Product analytics and user tracking
- **Custom Analytics** - Dashboard interaction tracking

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vitest** - Unit testing

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with sidebar and header
│   └── NotificationCenter.tsx
├── pages/              # Page components
│   ├── Dashboard.tsx   # Main dashboard with KPIs and charts
│   ├── Analytics.tsx   # Advanced analytics and metrics
│   ├── Orders.tsx      # Order management
│   ├── Customers.tsx   # Customer management
│   ├── Inventory.tsx   # Inventory tracking
│   └── Settings.tsx    # Application settings
├── services/           # API and external services
│   ├── api.ts         # API client and data fetching
│   └── posthog.ts     # Analytics tracking
├── types/              # TypeScript type definitions
│   └── index.ts
├── utils/              # Utility functions
│   ├── index.ts       # Formatting and helper functions
│   └── exportUtils.ts # Data export functionality
└── main.tsx           # Application entry point
```

## 🎨 Key Components

### Dashboard Layout
- **Responsive Sidebar**: Navigation with active state indicators
- **Compact Header**: Search bar, notifications, and user menu
- **Main Content Area**: Flexible content container

### Data Visualization
- **Line Charts**: Sales trends and performance over time
- **Bar Charts**: Customer growth and comparison metrics
- **Progress Bars**: Conversion funnel visualization
- **Metric Cards**: KPI displays with trend indicators

### Interactive Features
- **Bulk Selection**: Multi-select functionality for orders
- **Dynamic Filtering**: Real-time search and filter capabilities
- **Export Tools**: CSV and Excel export for all data
- **Real-time Updates**: Live data refresh and notifications

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001/api
VITE_POSTHOG_API_KEY=your_posthog_api_key
VITE_POSTHOG_HOST=https://app.posthog.com
```

### PostHog Analytics
The dashboard includes PostHog analytics for tracking user interactions. To enable:

1. Sign up for a PostHog account
2. Get your API key
3. Add it to your environment variables
4. Analytics will automatically track dashboard interactions

## 📊 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

## 🧪 Testing

The project includes comprehensive testing with Testsprite:

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit
npm run test:integration
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the Vite configuration
3. Deploy with one click

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist/` folder to Netlify
3. Configure redirects for client-side routing

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Team** for the amazing framework
- **Tailwind CSS** for the utility-first CSS approach
- **Vite** for the fast build tool
- **Recharts** for beautiful data visualization
- **Lucide** for the beautiful icons

## 📞 Support

If you have any questions or need help:

- 📧 Email: [your-email@example.com]
- 🐛 Issues: [GitHub Issues](https://github.com/piyush-pb/ecom-dash/issues)
- 📖 Documentation: [Wiki](https://github.com/piyush-pb/ecom-dash/wiki)

---

**Made with ❤️ by [Your Name]**

[![GitHub stars](https://img.shields.io/github/stars/piyush-pb/ecom-dash?style=social)](https://github.com/piyush-pb/ecom-dash)
[![GitHub forks](https://img.shields.io/github/forks/piyush-pb/ecom-dash?style=social)](https://github.com/piyush-pb/ecom-dash)
[![GitHub issues](https://img.shields.io/github/issues/piyush-pb/ecom-dash)](https://github.com/piyush-pb/ecom-dash/issues) 