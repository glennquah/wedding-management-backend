#!/usr/bin/env python3
"""
Generate Entity Relationship Diagram from Prisma Schema
"""

from graphviz import Digraph
import re

# Read the Prisma schema
with open('prisma/schema.prisma', 'r') as f:
    schema_content = f.read()

# Initialize the graph
dot = Digraph(comment='Wedding Management ERD', format='png')
dot.attr(rankdir='TB', size='50,50!', dpi='300', bgcolor='white')
dot.attr('node', shape='record', style='filled', fontname='Arial', fontsize='10')
dot.attr('edge', fontname='Arial', fontsize='9')

# Define color scheme for different model types
colors = {
    'User': '#DAE8FC',
    'Admin': '#D5E8D4',
    'SuperAdmin': '#D5E8D4',
    'Vendor': '#D5E8D4',
    'Wedding': '#FFF2CC',
    'Guest': '#E1D5E7',
    'GoogleCalendarConnection': '#F8CECC',
    'Listing': '#FFE6CC',
    'Order': '#FFE6CC',
    'OrderListing': '#FFE6CC',
    'Review': '#FFE6CC',
    'Cart': '#FFE6CC',
    'CartItem': '#FFE6CC',
    'Payment': '#FFE6CC',
    'VendorEarning': '#FFE6CC',
    'VendorPayout': '#FFE6CC',
    'DatingPartnerCommission': '#FFE6CC',
    'NotificationDetails': '#F5F5F5',
    'EmailTemplate': '#F5F5F5',
    'EmailNotificationHistory': '#F5F5F5',
    'TokenBlacklist': '#F5F5F5',
}

# Default color for wedding features
default_color = '#FFF2CC'

# Parse models from the schema
model_pattern = r'model\s+(\w+)\s*\{([^}]+)\}'
models = re.findall(model_pattern, schema_content, re.MULTILINE)

# Store relationships
relationships = []

# Process each model
for model_name, model_body in models:
    fields = []
    lines = model_body.strip().split('\n')

    for line in lines:
        line = line.strip()
        if not line or line.startswith('//') or line.startswith('@@'):
            continue

        # Parse field
        parts = line.split()
        if len(parts) >= 2:
            field_name = parts[0]
            field_type = parts[1]

            # Check for special attributes
            is_pk = '@id' in line or field_name == 'id'
            is_unique = '@unique' in line
            is_optional = '?' in field_type

            # Format field display
            field_display = field_name

            # Add type
            clean_type = field_type.replace('?', '').replace('[]', '')
            field_display += f': {clean_type}'

            # Add modifiers
            modifiers = []
            if is_pk:
                modifiers.append('PK')
            if is_unique and not is_pk:
                modifiers.append('unique')
            if '[]' in field_type:
                modifiers.append('array')
            if is_optional:
                modifiers.append('?')

            if modifiers:
                field_display += f' ({", ".join(modifiers)})'

            fields.append(field_display)

            # Detect relationships
            if '@relation' in line or (clean_type in [m[0] for m in models] and clean_type != model_name):
                # This is a relationship field
                if 'fields:' in line and 'references:' in line:
                    # This model has FK to other model
                    relationships.append({
                        'from': model_name,
                        'to': clean_type,
                        'field': field_name,
                        'type': '1:N' if '[]' in field_type else '1:1'
                    })

    # Create node label
    color = colors.get(model_name, default_color)
    label = f'{{{model_name}|' + '\\l'.join(fields) + '\\l}'

    dot.node(model_name, label, fillcolor=color, color='#000000')

# Add relationships
added_edges = set()
for rel in relationships:
    edge_key = f"{rel['from']}-{rel['to']}-{rel['field']}"
    if edge_key not in added_edges:
        dot.edge(rel['from'], rel['to'], label=rel['type'], color='#333333', arrowhead='crow')
        added_edges.add(edge_key)

# Manual relationship additions for many-to-many and special cases
special_relationships = [
    ('Admin', 'Wedding', 'M:N (admins)'),
    ('Wedding', 'Admin', '1:1 (mainCouple)'),
    ('Guest', 'Guest', '1:N (primary)'),
    ('Order', 'Listing', 'M:N (via OrderListing)'),
]

for from_model, to_model, label in special_relationships:
    dot.edge(from_model, to_model, label=label, color='#666666', style='dashed', arrowhead='crow')

# Add legend
legend = '''
{Legend|
Color Code:\\l
• Blue = User/Auth\\l
• Green = User Roles\\l
• Yellow = Wedding Features\\l
• Orange = Marketplace\\l
• Purple = Guest\\l
• Red = Calendar\\l
• Gray = Notifications\\l
\\l
Relationships:\\l
• 1:1 = One-to-One\\l
• 1:N = One-to-Many\\l
• M:N = Many-to-Many\\l
\\l
Total Models: 35\\l
}
'''

dot.node('Legend', legend, shape='record', fillcolor='#FFFACD', color='#000000')

# Render the graph
output_path = 'wedding_management_erd'
dot.render(output_path, cleanup=True)

print(f"ERD diagram generated successfully: {output_path}.png")
print(f"Image size optimized for clarity with 300 DPI")
