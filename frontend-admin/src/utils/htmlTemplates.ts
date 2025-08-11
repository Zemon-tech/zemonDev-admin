/**
 * HTML templates for common use cases in forge resources
 */

export interface HtmlTemplate {
  name: string;
  description: string;
  content: string;
  category: 'basic' | 'media' | 'interactive' | 'layout';
}

export const htmlTemplates: HtmlTemplate[] = [
  {
    name: 'Basic Article',
    description: 'Simple article with headings, paragraphs, and basic formatting',
    category: 'basic',
    content: `<!DOCTYPE html>
<html>
<head>
    <title>Article Title</title>
</head>
<body>
    <h1>Main Article Title</h1>
    <p class="lead">This is a lead paragraph that introduces the main content of the article.</p>
    
    <h2>Section Heading</h2>
    <p>This is a regular paragraph with some content. You can add <strong>bold text</strong> and <em>italic text</em> as needed.</p>
    
    <h2>Another Section</h2>
    <p>Here's another section with more content. You can include:</p>
    <ul>
        <li>Bullet points</li>
        <li>Lists of items</li>
        <li>Important information</li>
    </ul>
    
    <h3>Subsection</h3>
    <p>This is a subsection with more detailed information.</p>
    
    <blockquote>
        <p>This is a blockquote that can highlight important information or quotes.</p>
    </blockquote>
</body>
</html>`
  },
  {
    name: 'Code Tutorial',
    description: 'Tutorial page with code examples and explanations',
    category: 'basic',
    content: `<!DOCTYPE html>
<html>
<head>
    <title>Code Tutorial</title>
</head>
<body>
    <h1>JavaScript Tutorial</h1>
    <p>Learn the basics of JavaScript programming.</p>
    
    <h2>Variables</h2>
    <p>Variables are used to store data in JavaScript:</p>
    <pre><code>let name = "John";
const age = 25;
var city = "New York";</code></pre>
    
    <h2>Functions</h2>
    <p>Functions are reusable blocks of code:</p>
    <pre><code>function greet(name) {
    return "Hello, " + name + "!";
}

const result = greet("World");
console.log(result); // Output: Hello, World!</code></pre>
    
    <h2>Arrays</h2>
    <p>Arrays store multiple values:</p>
    <pre><code>const fruits = ["apple", "banana", "orange"];
fruits.push("grape");
console.log(fruits.length); // Output: 4</code></pre>
</body>
</html>`
  },
  {
    name: 'Image Gallery',
    description: 'Gallery layout with images and captions',
    category: 'media',
    content: `<!DOCTYPE html>
<html>
<head>
    <title>Image Gallery</title>
</head>
<body>
    <h1>Photo Gallery</h1>
    <p>A collection of beautiful images with descriptions.</p>
    
    <div class="gallery">
        <div class="gallery-item">
            <img src="https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Image+1" alt="Placeholder Image 1" width="300" height="200">
            <p class="caption">Beautiful landscape with mountains</p>
        </div>
        
        <div class="gallery-item">
            <img src="https://via.placeholder.com/300x200/10B981/FFFFFF?text=Image+2" alt="Placeholder Image 2" width="300" height="200">
            <p class="caption">Serene lake reflection</p>
        </div>
        
        <div class="gallery-item">
            <img src="https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Image+3" alt="Placeholder Image 3" width="300" height="200">
            <p class="caption">Sunset over the ocean</p>
        </div>
    </div>
    
    <style>
        .gallery {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .gallery-item {
            text-align: center;
        }
        .caption {
            margin-top: 10px;
            font-style: italic;
            color: #666;
        }
    </style>
</body>
</html>`
  },
  {
    name: 'Video Player',
    description: 'Page with embedded video and description',
    category: 'media',
    content: `<!DOCTYPE html>
<html>
<head>
    <title>Video Tutorial</title>
</head>
<body>
    <h1>Getting Started with Web Development</h1>
    <p>Watch this comprehensive tutorial to learn the basics of web development.</p>
    
    <div class="video-container">
        <video width="100%" height="400" controls poster="https://via.placeholder.com/800x400/1F2937/FFFFFF?text=Video+Thumbnail">
            <source src="your-video.mp4" type="video/mp4">
            <source src="your-video.webm" type="video/webm">
            Your browser does not support the video tag.
        </video>
    </div>
    
    <h2>Video Description</h2>
    <p>This video covers:</p>
    <ul>
        <li>HTML basics and structure</li>
        <li>CSS styling and layout</li>
        <li>JavaScript fundamentals</li>
        <li>Responsive design principles</li>
    </ul>
    
    <h2>Additional Resources</h2>
    <p>After watching this video, check out these related resources:</p>
    <ul>
        <li><a href="#" target="_blank">HTML Reference Guide</a></li>
        <li><a href="#" target="_blank">CSS Cheat Sheet</a></li>
        <li><a href="#" target="_blank">JavaScript Examples</a></li>
    </ul>
    
    <style>
        .video-container {
            margin: 20px 0;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
    </style>
</body>
</html>`
  },
  {
    name: 'Interactive Form',
    description: 'Form with various input types and validation',
    category: 'interactive',
    content: `<!DOCTYPE html>
<html>
<head>
    <title>Contact Form</title>
</head>
<body>
    <h1>Contact Us</h1>
    <p>Fill out the form below to get in touch with us.</p>
    
    <form class="contact-form">
        <div class="form-group">
            <label for="name">Full Name *</label>
            <input type="text" id="name" name="name" required placeholder="Enter your full name">
        </div>
        
        <div class="form-group">
            <label for="email">Email Address *</label>
            <input type="email" id="email" name="email" required placeholder="Enter your email">
        </div>
        
        <div class="form-group">
            <label for="subject">Subject</label>
            <select id="subject" name="subject">
                <option value="">Select a subject</option>
                <option value="general">General Inquiry</option>
                <option value="support">Technical Support</option>
                <option value="feedback">Feedback</option>
                <option value="other">Other</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="message">Message *</label>
            <textarea id="message" name="message" rows="5" required placeholder="Enter your message here..."></textarea>
        </div>
        
        <div class="form-group">
            <label>
                <input type="checkbox" name="newsletter" value="yes">
                Subscribe to our newsletter
            </label>
        </div>
        
        <button type="submit" class="submit-btn">Send Message</button>
    </form>
    
    <style>
        .contact-form {
            max-width: 600px;
            margin: 20px 0;
        }
        .form-group {
            margin-bottom: 20px;
        }
        .form-group label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 16px;
        }
        .submit-btn {
            background-color: #4F46E5;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
        }
        .submit-btn:hover {
            background-color: #3730A3;
        }
    </style>
</body>
</html>`
  },
  {
    name: 'Data Table',
    description: 'Table with data and styling',
    category: 'layout',
    content: `<!DOCTYPE html>
<html>
<head>
    <title>Data Table</title>
</head>
<body>
    <h1>Project Statistics</h1>
    <p>Overview of our project metrics and performance data.</p>
    
    <table class="data-table">
        <thead>
            <tr>
                <th>Project</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Team Size</th>
                <th>Deadline</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Website Redesign</td>
                <td><span class="status-badge status-active">Active</span></td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 75%"></div>
                    </div>
                    <span class="progress-text">75%</span>
                </td>
                <td>5</td>
                <td>Dec 15, 2024</td>
            </tr>
            <tr>
                <td>Mobile App</td>
                <td><span class="status-badge status-completed">Completed</span></td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 100%"></div>
                    </div>
                    <span class="progress-text">100%</span>
                </td>
                <td>8</td>
                <td>Nov 30, 2024</td>
            </tr>
            <tr>
                <td>API Development</td>
                <td><span class="status-badge status-pending">Pending</span></td>
                <td>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: 25%"></div>
                    </div>
                    <span class="progress-text">25%</span>
                </td>
                <td>3</td>
                <td>Jan 15, 2025</td>
            </tr>
        </tbody>
    </table>
    
    <style>
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        .data-table th,
        .data-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .data-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .status-badge {
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
        }
        .status-active {
            background-color: #10B981;
            color: white;
        }
        .status-completed {
            background-color: #059669;
            color: white;
        }
        .status-pending {
            background-color: #F59E0B;
            color: white;
        }
        .progress-bar {
            width: 100px;
            height: 8px;
            background-color: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
            display: inline-block;
            margin-right: 8px;
        }
        .progress-fill {
            height: 100%;
            background-color: #4F46E5;
            transition: width 0.3s ease;
        }
        .progress-text {
            font-size: 12px;
            color: #666;
        }
    </style>
</body>
</html>`
  }
];

/**
 * Get templates by category
 */
export const getTemplatesByCategory = (category: HtmlTemplate['category']): HtmlTemplate[] => {
  return htmlTemplates.filter(template => template.category === category);
};

/**
 * Get all template categories
 */
export const getTemplateCategories = (): HtmlTemplate['category'][] => {
  return [...new Set(htmlTemplates.map(template => template.category))];
};

/**
 * Get template by name
 */
export const getTemplateByName = (name: string): HtmlTemplate | undefined => {
  return htmlTemplates.find(template => template.name === name);
};
