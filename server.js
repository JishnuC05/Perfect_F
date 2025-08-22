const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Size standards for comparison
const SIZE_CHARTS = {
  male: {
    shirt: {
      S: { chest: 36, shoulder: 17, length: 28 },
      M: { chest: 40, shoulder: 18, length: 29 },
      L: { chest: 44, shoulder: 19, length: 30 },
      XL: { chest: 48, shoulder: 20, length: 31 }
    },
    pant: {
      30: { waist: 30, hip: 38, inseam: 30 },
      32: { waist: 32, hip: 40, inseam: 32 },
      34: { waist: 34, hip: 42, inseam: 34 },
      36: { waist: 36, hip: 44, inseam: 36 }
    }
  },
  female: {
    shirt: {
      S: { chest: 34, shoulder: 15, length: 26 },
      M: { chest: 36, shoulder: 16, length: 27 },
      L: { chest: 38, shoulder: 17, length: 28 },
      XL: { chest: 40, shoulder: 18, length: 29 }
    },
    pant: {
      28: { waist: 28, hip: 36, inseam: 28 },
      30: { waist: 30, hip: 38, inseam: 30 },
      32: { waist: 32, hip: 40, inseam: 32 },
      34: { waist: 34, hip: 42, inseam: 34 }
    }
  }
};

// Fit analysis algorithm
function analyzeFit(userMeasurements, productMeasurements, gender, type) {
  const tolerance = 2; // inches
  const results = {};
  
  Object.keys(userMeasurements).forEach(measurement => {
    const user = parseFloat(userMeasurements[measurement]);
    const product = parseFloat(productMeasurements[measurement]);
    
    if (Math.abs(user - product) <= tolerance) {
      results[measurement] = 'perfect';
    } else if (product > user + tolerance) {
      results[measurement] = 'loose';
    } else {
      results[measurement] = 'tight';
    }
  });
  
  const perfectCount = Object.values(results).filter(r => r === 'perfect').length;
  const overallFit = perfectCount >= Object.keys(results).length / 2 ? 'good' : 'poor';
  
  return { measurements: results, overall: overallFit };
}

// Style recommendations
function getStyleRecommendations(gender, type, fitResults) {
  const recommendations = [];
  
  if (gender === 'male') {
    if (type === 'shirt') {
      recommendations.push({
        style: 'Classic Fit',
        description: 'Comfortable and versatile for everyday wear',
        image: 'https://via.placeholder.com/200x250/007bff/ffffff?text=Classic+Fit'
      });
      recommendations.push({
        style: 'Slim Fit',
        description: 'Modern tailored look for a sleek appearance',
        image: 'https://via.placeholder.com/200x250/28a745/ffffff?text=Slim+Fit'
      });
    } else {
      recommendations.push({
        style: 'Straight Leg',
        description: 'Timeless and comfortable cut',
        image: 'https://via.placeholder.com/200x250/ffc107/000000?text=Straight+Leg'
      });
      recommendations.push({
        style: 'Tapered Fit',
        description: 'Contemporary style with narrower ankle',
        image: 'https://via.placeholder.com/200x250/dc3545/ffffff?text=Tapered+Fit'
      });
    }
  } else {
    if (type === 'shirt') {
      recommendations.push({
        style: 'Regular Fit',
        description: 'Comfortable and flattering for all body types',
        image: 'https://via.placeholder.com/200x250/e83e8c/ffffff?text=Regular+Fit'
      });
      recommendations.push({
        style: 'Fitted',
        description: 'Elegant silhouette that follows your curves',
        image: 'https://via.placeholder.com/200x250/6f42c1/ffffff?text=Fitted'
      });
    } else {
      recommendations.push({
        style: 'High Waist',
        description: 'Flattering and on-trend style',
        image: 'https://via.placeholder.com/200x250/fd7e14/ffffff?text=High+Waist'
      });
      recommendations.push({
        style: 'Bootcut',
        description: 'Classic and versatile fit',
        image: 'https://via.placeholder.com/200x250/20c997/ffffff?text=Bootcut'
      });
    }
  }
  
  return recommendations;
}

// Health check route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check API
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Perfect Fit API is running' });
});

// API Routes
app.post('/api/analyze-fit', async (req, res) => {
  try {
    const { userMeasurements, productLink, gender, type } = req.body;
    
    // Validate input
    if (!userMeasurements || !gender || !type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Mock product measurements extraction (in real app, would scrape from link)
    const mockProductMeasurements = SIZE_CHARTS[gender][type]['M'];
    
    const fitResults = analyzeFit(userMeasurements, mockProductMeasurements, gender, type);
    const recommendations = getStyleRecommendations(gender, type, fitResults);
    
    res.json({
      fit: fitResults,
      productMeasurements: mockProductMeasurements,
      recommendations
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Handle 404
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});