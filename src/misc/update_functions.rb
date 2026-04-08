#!/usr/bin/ruby
## A script to update functions in nightly references
## Usage: ruby src/misc/update_functions.rb
# encoding: utf-8
require 'net/http'
require 'uri'
require 'fileutils'

BASE_URL = "https://raw.githubusercontent.com/apache/datafusion/main/docs/source/user-guide/sql/"
OUTPUT_DIR = "./docs/reference/sql/functions"
SUB_DIR = "df-functions"

scalar_functions = {
  :name => "DataFusion Scalar Functions",
  :url => BASE_URL + "scalar_functions.md"
}
agg_functions = {
  :name => "DataFusion Aggregate Functions",
  :url => BASE_URL + "aggregate_functions.md"
}
window_functions = {
  :name => "DataFusion Window Functions",
  :url => BASE_URL + "window_functions.md"
}
special_functions = {
  :name => "DataFusion Special Functions",
  :url => BASE_URL + "special_functions.md"
}

## Apache DataFusion functions (merged into df-functions.md)
datafusion_functions = [scalar_functions, agg_functions, window_functions, special_functions]

## Filenames of merged docs (used to distinguish internal vs external links)
MERGED_FILENAMES = datafusion_functions.map { |doc| File.basename(URI(doc[:url]).path) }

def process_headlines(line)
  ## Add a level of headlines
  if line =~ /^\s*(#+)\s/
    replacement = "#{$1}#"
    ## We don't want to render the function names in right menu bar
    replacement += "#" if replacement.length >= 4
    line.gsub! $1, replacement
  end
  line
end

def fix_links(line)
  ## Fix link for merged files: a_b_c.md -> #a-b-c
  line.gsub!(/\]\(([a-zA-Z0-9_]+\.md)\)/) { |match|
    filename = $1
    if MERGED_FILENAMES.include?(filename)
      match.gsub("_", "-").gsub(".md", "").gsub("](", "](#")
    else
      ## External referenced file: add subdirectory prefix
      "](#{SUB_DIR}/#{filename})"
    end
  }

  ## Fix link for external files with anchor: a_b_c.md#anchor -> df-functions/a_b_c.md#anchor
  line.gsub!(/\]\(([a-zA-Z0-9_]+\.md)(#[a-zA-Z0-9_-]+)\)/) { |match|
    filename = $1
    anchor = $2
    if MERGED_FILENAMES.include?(filename)
      ## Merged file: convert to internal anchor
      "](#{anchor})"
    else
      ## External referenced file: add subdirectory prefix
      "](#{SUB_DIR}/#{filename}#{anchor})"
    end
  }

  line
end

def escape_mdx_angles(lines)
  in_code_block = false

  lines.map do |line|
    stripped = line.strip
    if stripped.start_with?("```") || stripped.start_with?("~~~")
      in_code_block = !in_code_block
      line
    elsif in_code_block
      line
    else
      ## Split line into inline-code segments and non-code segments
      ## Preserve inline code as-is, escape < in the rest
      parts = line.split(/(`[^`]+`)/)
      parts.map { |part|
        if part.start_with?("`") && part.end_with?("`")
          ## Inline code, keep as-is
          part
        else
          ## Escape bare < that are NOT part of HTML comments or valid HTML tags
          ## Keep: <!-- -->, <tag>, </tag>, <br/>, etc.
          part.gsub(/</) { |m|
            ## Look at what follows the <
            rest = $' || ""
            if rest =~ /\A!--/           ## HTML comment start
              m
            elsif rest =~ /\A\/?[a-zA-Z]/ ## HTML tag
              m
            else
              "&lt;"
            end
          }
        end
      }.join
    end
  end
end

def fetch_markdown(url)
  uri = URI(url)
  Net::HTTP.get(uri).force_encoding(Encoding::UTF_8)
end

def process_lines(lines)
  lines.map! do |line|
    line = process_headlines(line)
    line = fix_links(line)
    line
  end
  escape_mdx_angles(lines)
end

## Scan content for relative .md references not in the merged set
def find_referenced_files(content)
  refs = Set.new
  content.scan(/\]\(([a-zA-Z0-9_]+\.md)(?:#[a-zA-Z0-9_-]*)?\)/) do |match|
    filename = match[0]
    refs.add(filename) unless MERGED_FILENAMES.include?(filename)
  end
  refs
end

## --- Main ---

require 'set'

## Step 1: Generate merged df-functions.md
all_content = ""

File.open("temp.md", "w") do |f|
  f.puts <<EOF
---
keywords: [DataFusion functions, scalar functions, window functions, array functions]
description: Generated from the Apache DataFusion project's documents, this page lists and describes DataFusion functions, including scalar, window, and array functions.
---
EOF

  f.puts("# DataFusion Functions\n\n")
  f.puts("This page is generated from the [Apache DataFusion](https://datafusion.apache.org/user-guide/sql/) project's documents:")

  for doc in datafusion_functions
    name = doc[:name]
    ## Generate anchor from name: "DataFusion Scalar Functions" -> "#scalar-functions"
    anchor = name.sub("DataFusion ", "").downcase.gsub(" ", "-")
    markdown = "  * [#{name}](##{anchor})"
    f.puts markdown
  end

  f.puts

  for doc in datafusion_functions
    markdown = fetch_markdown(doc[:url])
    all_content += markdown + "\n"

    lines = markdown.split(/\n/)
    lines = process_lines(lines)

    f.puts lines.join("\n")
  end
end

File.rename "temp.md", "#{OUTPUT_DIR}/df-functions.md"
puts "#{OUTPUT_DIR}/df-functions.md updated!"

## Step 2: Recursively fetch and save referenced .md files to subdirectory
fetched = Set.new
pending = find_referenced_files(all_content)
max_depth = 3
depth = 0

sub_dir_path = "#{OUTPUT_DIR}/#{SUB_DIR}"
FileUtils.mkdir_p(sub_dir_path)

while !pending.empty? && depth < max_depth
  new_pending = Set.new

  pending.each do |filename|
    next if fetched.include?(filename)
    fetched.add(filename)

    url = BASE_URL + filename
    puts "Fetching referenced doc: #{filename}"

    begin
      markdown = fetch_markdown(url)
    rescue => e
      puts "  WARNING: Failed to fetch #{url}: #{e.message}"
      next
    end

    lines = markdown.split(/\n/)
    lines = process_lines(lines)

    ## Find further references from this file
    new_refs = find_referenced_files(lines.join("\n"))
    new_pending.merge(new_refs - fetched)

    ## Write as standalone file with frontmatter
    title = filename.gsub("_", " ").gsub(".md", "").split.map(&:capitalize).join(" ")
    File.open("#{sub_dir_path}/#{filename}", "w") do |f|
      f.puts "---"
      f.puts "title: \"#{title}\""
      f.puts "unlisted: true"
      f.puts "---"
      f.puts
      f.puts lines.join("\n")
    end

    puts "  Saved to #{sub_dir_path}/#{filename}"
  end

  pending = new_pending
  depth += 1
end

puts "Done!"
