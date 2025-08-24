#!/usr/bin/env node

/**
 * Extract author and collaboration data from publication QMD files
 * This script scans publication files and generates data for the collaborators page
 */

const fs = require('fs');
const path = require('path');

// Known lab members and alumni for filtering
const LAB_MEMBERS = [
    "Steven Roberts", "Steven B. Roberts", "Steven B Roberts",
    "Mackenzie Gavery", "Mackenzie R. Gavery", "Mackenzie R Gavery",
    "Shelly Wanamaker", "Shelly A. Wanamaker", "Shelly A Wanamaker",
    "Emma Timmins-Schiffman", "Emma B. Timmins-Schiffman", "Emma B Timmins-Schiffman",
    "Yaamini Venkataraman", "Yaamini R. Venkataraman", "Yaamini R Venkataraman",
    "Laura Spencer", "Laura H. Spencer", "Laura H Spencer", 
    "Grace Crandall", "Grace A. Crandall", "Grace A Crandall",
    "Matt George", "Matthew George", "Matthew N. George", "Matthew N George",
    "Zach Bengtsson", "Zachary Bengtsson",
    "Chris Mantegna", "Christopher Mantegna",
    "Celeste Valdivia",
    "Hollie Putnam", "Hollie M. Putnam", "Hollie M Putnam",
    "Brent Vadopalas",
    "Sam White", "Samuel White", "Samuel J. White", "Samuel J White",
    "Jay Dimond", "James Dimond", "James L. Dimond", "James L Dimond",
    "Aspen Coyle",
    "Olivia Cattau",
    "Jake Heare",
    "Andy Jasonowicz", "Andrew Jasonowicz",
    "Claire Olson", "Claire E. Olson", "Claire E Olson",
    "Doug Immerman",
    "Caroline Storer",
    "Dave Metzger", "David Metzger", "David C. Metzger", "David C Metzger",
    "Giles Goetz", "Frederick Goetz", "Frederick W. Goetz", "Frederick W Goetz",
    "Delaney Lawson",
    "Kaitlyn Mitchell", "Kaitlyn R. Mitchell", "Kaitlyn R Mitchell",
    "Crystal Simchick",
    "Megan Hintz",
    "Rhonda Elliott", "Rhonda Elliott Thompson",
    "Benoit Eudeline",
    "Larken Root"
];

function normalizeAuthorName(name) {
    return name.replace(/[.,]/g, '').trim().toLowerCase();
}

function isLabMember(authorName) {
    const normalized = normalizeAuthorName(authorName);
    
    // Direct match
    if (LAB_MEMBERS.some(labMember => normalizeAuthorName(labMember) === normalized)) {
        return true;
    }
    
    // Check for partial matches (handle initials, etc.)
    const authorParts = authorName.toLowerCase().split(' ');
    
    return LAB_MEMBERS.some(labMember => {
        const labParts = labMember.toLowerCase().split(' ');
        
        // Check if last names match and first initial matches
        if (authorParts.length >= 2 && labParts.length >= 2) {
            const authorLast = authorParts[authorParts.length - 1];
            const labLast = labParts[labParts.length - 1];
            const authorFirst = authorParts[0];
            const labFirst = labParts[0];
            
            return (authorLast === labLast && 
                    (authorFirst === labFirst || 
                     authorFirst.charAt(0) === labFirst.charAt(0) ||
                     labFirst.charAt(0) === authorFirst.charAt(0)));
        }
        
        return false;
    });
}

function parseAuthors(authorString) {
    // Handle various author format patterns
    if (authorString.includes(' et al.')) {
        // Handle "Author et al." format - extract the first authors
        const firstAuthor = authorString.replace(' et al.', '').trim();
        return [firstAuthor];
    }
    
    // Clean up the string
    let cleanString = authorString.replace(/"/g, '').trim();
    
    // Handle specific patterns found in the data
    let authors = [];
    
    // Pattern 1: "Name1, Name2, Name3" (most common)
    if (cleanString.includes(', ')) {
        authors = cleanString.split(', ');
    }
    // Pattern 2: "Name1 & Name2" 
    else if (cleanString.includes(' & ')) {
        authors = cleanString.split(' & ');
    }
    // Pattern 3: "Name1 and Name2"
    else if (cleanString.includes(' and ')) {
        authors = cleanString.split(' and ');
    }
    // Pattern 4: Single author
    else {
        authors = [cleanString];
    }
    
    // Clean and filter authors
    return authors
        .map(author => author.trim())
        .filter(author => author.length > 0)
        .filter(author => !author.match(/^[A-Z]\.?$/)) // Remove single initials
        .map(author => {
            // Clean up the name
            author = author.replace(/\s+/g, ' '); // Normalize whitespace
            author = author.replace(/,$/, ''); // Remove trailing comma
            
            // Handle "Last, First" to "First Last" conversion if needed
            if (author.includes(',') && !author.includes(' ')) {
                const parts = author.split(',');
                if (parts.length === 2) {
                    author = `${parts[1].trim()} ${parts[0].trim()}`;
                }
            }
            
            return author;
        });
}

function extractPublicationData(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        
        let inYamlHeader = false;
        let yamlLines = [];
        
        for (let line of lines) {
            if (line.trim() === '---') {
                if (!inYamlHeader) {
                    inYamlHeader = true;
                    continue;
                } else {
                    break;
                }
            }
            if (inYamlHeader) {
                yamlLines.push(line);
            }
        }
        
        // Parse YAML-like content with multi-line support
        const publication = {};
        let currentKey = null;
        let currentValue = '';
        
        yamlLines.forEach(line => {
            // Check if this is a new key-value pair
            const match = line.match(/^(\w+):\s*(.*)$/);
            
            if (match) {
                // Save previous key-value if exists
                if (currentKey) {
                    publication[currentKey] = currentValue.replace(/^"(.*)"$/, '$1').trim();
                }
                
                currentKey = match[1];
                currentValue = match[2] || '';
            } else if (currentKey && line.trim()) {
                // This is a continuation of the previous value
                currentValue += ' ' + line.trim();
            }
        });
        
        // Save the last key-value pair
        if (currentKey) {
            publication[currentKey] = currentValue.replace(/^"(.*)"$/, '$1').trim();
        }
        
        if (publication.author) {
            publication.authors = parseAuthors(publication.author);
        }
        
        return publication;
    } catch (error) {
        console.error(`Error parsing ${filePath}:`, error.message);
        return null;
    }
}

function scanPublications(publicationsDir) {
    const publications = [];
    const files = fs.readdirSync(publicationsDir);
    
    files.forEach(file => {
        if (file.endsWith('.qmd')) {
            const filePath = path.join(publicationsDir, file);
            const publication = extractPublicationData(filePath);
            if (publication && publication.authors) {
                publications.push(publication);
            }
        }
    });
    
    return publications;
}

function analyzeCollaborations(publications) {
    const externalCollaborators = new Map();
    const collaborationNetwork = [];
    const coAuthorships = new Map();
    
    publications.forEach(pub => {
        if (!pub.authors) return;
        
        // Track external collaborators
        pub.authors.forEach(author => {
            if (!isLabMember(author)) {
                const count = externalCollaborators.get(author) || 0;
                externalCollaborators.set(author, count + 1);
            }
        });
        
        // Build collaboration network
        for (let i = 0; i < pub.authors.length; i++) {
            for (let j = i + 1; j < pub.authors.length; j++) {
                const author1 = pub.authors[i];
                const author2 = pub.authors[j];
                const key = [author1, author2].sort().join('|');
                
                if (!coAuthorships.has(key)) {
                    coAuthorships.set(key, []);
                }
                coAuthorships.get(key).push(pub.title);
            }
        }
    });
    
    // Convert to network format
    coAuthorships.forEach((papers, key) => {
        const [author1, author2] = key.split('|');
        collaborationNetwork.push({
            source: author1,
            target: author2,
            weight: papers.length,
            publications: papers
        });
    });
    
    return {
        publications,
        externalCollaborators: Array.from(externalCollaborators.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([name, count]) => ({ name, count })),
        collaborationNetwork
    };
}

function generateDataFile(analysisResult, outputPath) {
    const data = {
        generated: new Date().toISOString(),
        ...analysisResult
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`Generated collaboration data: ${outputPath}`);
}

// Main execution
if (require.main === module) {
    const publicationsDir = path.join(__dirname, 'publications', 'articles');
    const outputPath = path.join(__dirname, 'docs', 'collaborations-data.json');
    
    try {
        const publications = scanPublications(publicationsDir);
        console.log(`Scanned ${publications.length} publications`);
        
        const analysis = analyzeCollaborations(publications);
        console.log(`Found ${analysis.externalCollaborators.length} external collaborators`);
        
        // Ensure output directory exists
        const outputDir = path.dirname(outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        generateDataFile(analysis, outputPath);
        
        // Also output summary to console
        console.log('\nTop 10 External Collaborators:');
        analysis.externalCollaborators.slice(0, 10).forEach(({ name, count }) => {
            console.log(`  ${name}: ${count} publications`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

module.exports = { analyzeCollaborations, scanPublications };