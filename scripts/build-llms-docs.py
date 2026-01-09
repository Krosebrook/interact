#!/usr/bin/env python3
"""
Documentation Authority Build Script
Aggregates all project documentation into llms-full.txt for LLM context.
"""

import os
import re
from datetime import datetime, timezone
from pathlib import Path

# Configuration
DOCS_DIR = 'components/docs'
OUTPUT_FILE = 'llms-full.txt'
SECTION_SEPARATOR = "\n\n" + "="*80 + "\n\n"

def sanitize_content(content):
    """
    Removes code blocks and other elements that might confuse LLMs.
    Preserves markdown structure and key information.
    """
    # Remove fenced code blocks (```...```)
    content = re.sub(r'```[\s\S]*?```', '[CODE BLOCK REMOVED]', content)
    
    # Remove inline code but keep the text visible
    content = re.sub(r'`([^`]+)`', r'\1', content)
    
    # Remove HTML comments
    content = re.sub(r'<!--[\s\S]*?-->', '', content)
    
    # Remove HTML tags but keep content
    content = re.sub(r'<([^>]+)>', '', content)
    
    # Normalize whitespace
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    return content.strip()

def extract_title(content):
    """Extract the first H1 heading as document title."""
    match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    return match.group(1) if match else "Untitled Document"

def build_llms_full_txt():
    """
    Collects all markdown documentation and compiles it into a single text file
    for LLM context with proper structure and metadata.
    """
    print(f"📚 Building LLM documentation from: {DOCS_DIR}")
    
    if not os.path.exists(DOCS_DIR):
        print(f"❌ Error: Documentation directory '{DOCS_DIR}' not found")
        return False
    
    full_docs_content = []
    processed_files = []
    
    # Header for the aggregated document
    full_docs_content.append("="*80)
    full_docs_content.append("\nINTERACT EMPLOYEE ENGAGEMENT PLATFORM - COMPLETE DOCUMENTATION")
    full_docs_content.append("\n" + "="*80 + "\n")
    full_docs_content.append(f"\nGenerated: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')} UTC")
    full_docs_content.append(f"\nSource Directory: {DOCS_DIR}")
    full_docs_content.append(f"\nPurpose: Comprehensive documentation context for AI/LLM operations")
    full_docs_content.append("\n\nThis document contains all available project documentation to provide")
    full_docs_content.append("\ncomplete context for AI assistants, code generation, and knowledge retrieval.")
    full_docs_content.append(SECTION_SEPARATOR)

    # Walk through docs directory
    for root, _, files in sorted(os.walk(DOCS_DIR)):
        markdown_files = sorted([f for f in files if f.endswith('.md')])
        
        for file in markdown_files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, DOCS_DIR)
            
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if not content.strip():
                    print(f"⚠️  Skipping empty file: {relative_path}")
                    continue
                
                title = extract_title(content)
                sanitized_text = sanitize_content(content)
                
                if sanitized_text:
                    full_docs_content.append(f"DOCUMENT: {relative_path}")
                    full_docs_content.append(f"\nTitle: {title}")
                    full_docs_content.append(f"\nFile Size: {len(content)} characters")
                    full_docs_content.append("\n" + "-"*80 + "\n")
                    full_docs_content.append(sanitized_text)
                    full_docs_content.append(SECTION_SEPARATOR)
                    
                    processed_files.append(relative_path)
                    print(f"✓ Processed: {relative_path} ({len(content)} chars)")
                    
            except Exception as e:
                print(f"❌ Error processing {file_path}: {e}")

    # Footer with statistics
    full_docs_content.append("="*80)
    full_docs_content.append(f"\n\nEND OF DOCUMENTATION")
    full_docs_content.append(f"\n\nTotal Documents Processed: {len(processed_files)}")
    full_docs_content.append(f"\nTotal Output Size: {sum(len(s) for s in full_docs_content)} characters")
    full_docs_content.append("\n\n" + "="*80)

    # Write the aggregated content
    try:
        output_path = Path(OUTPUT_FILE)
        with open(output_path, 'w', encoding='utf-8') as outfile:
            outfile.write("".join(full_docs_content))
        
        file_size = output_path.stat().st_size
        print(f"\n✅ Successfully built {OUTPUT_FILE}")
        print(f"📊 Output size: {file_size:,} bytes ({file_size/1024:.1f} KB)")
        print(f"📄 Documents included: {len(processed_files)}")
        return True
        
    except Exception as e:
        print(f"❌ Error writing to {OUTPUT_FILE}: {e}")
        return False

if __name__ == "__main__":
    success = build_llms_full_txt()
    exit(0 if success else 1)
