export interface SuperCategory {
  id: string;
  name: string;
  description: string;
  nodeIds: string[];
  color: string;
}

export function generateSuperCategories(nodes: any[]): SuperCategory[] {
  if (nodes.length === 0) return [];

  // Define the 6 standard super categories
  const superCategoryTemplates = [
    {
      name: "Technology",
      description: "AI, tech companies, digital innovation, software, hardware",
      color: "bg-blue-100 border-blue-300 text-blue-800"
    },
    {
      name: "Politics", 
      description: "Government, policy, elections, political developments",
      color: "bg-red-100 border-red-300 text-red-800"
    },
    {
      name: "Economy",
      description: "Business, markets, financial trends, economic policy",
      color: "bg-green-100 border-green-300 text-green-800"
    },
    {
      name: "International",
      description: "Global affairs, diplomacy, international relations",
      color: "bg-purple-100 border-purple-300 text-purple-800"
    },
    {
      name: "Society",
      description: "Social issues, culture, public health, community",
      color: "bg-yellow-100 border-yellow-300 text-yellow-800"
    },
    {
      name: "Science",
      description: "Research, medical breakthroughs, scientific studies",
      color: "bg-indigo-100 border-indigo-300 text-indigo-800"
    }
  ];

  // Group nodes by their related topics
  const categoryNodes = new Map<string, string[]>();
  
  // Initialize category nodes arrays
  superCategoryTemplates.forEach(template => {
    categoryNodes.set(template.name, []);
  });

  // Assign each node to categories based on its relatedTopics
  nodes.forEach(node => {
    const relatedTopics = node.data.relatedTopics || [];
    
    // Since we now assign exactly one super category per node, 
    // we should only add the node to its primary category
    relatedTopics.forEach((topic: string) => {
      if (categoryNodes.has(topic)) {
        // Only add if not already added (to handle multiple related topics gracefully)
        const existingNodes = categoryNodes.get(topic) || [];
        if (!existingNodes.includes(node.id)) {
          existingNodes.push(node.id);
          categoryNodes.set(topic, existingNodes);
        }
      }
    });
  });

  // Create super categories
  const superCategories: SuperCategory[] = superCategoryTemplates
    .filter(template => (categoryNodes.get(template.name)?.length || 0) > 0)
    .map((template, index) => ({
      id: `super-cat-${index}`,
      name: template.name,
      description: template.description,
      nodeIds: categoryNodes.get(template.name) || [],
      color: template.color
    }));

  return superCategories;
}

export function getNodesForCategory(nodes: any[], categoryId: string, superCategories: SuperCategory[]): any[] {
  const category = superCategories.find(cat => cat.id === categoryId);
  if (!category) return nodes;
  
  return nodes.filter(node => category.nodeIds.includes(node.id));
}

export function getCategoryStats(superCategories: SuperCategory[]): { total: number; categories: { name: string; count: number }[] } {
  return {
    total: superCategories.reduce((sum, cat) => sum + cat.nodeIds.length, 0),
    categories: superCategories.map(cat => ({
      name: cat.name,
      count: cat.nodeIds.length
    }))
  };
}
