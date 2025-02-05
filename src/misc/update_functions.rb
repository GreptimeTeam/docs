#!/usr/bin/ruby
## A script to update functions in nightly references
## Usage: ruby misc/update_functions.rb [nightly | v0.x]
# encoding: utf-8
require 'net/http'

scalar_functions = {
  :name => "DataFusion Scalar Functions",
  :url => "https://raw.githubusercontent.com/apache/datafusion/main/docs/source/user-guide/sql/scalar_functions.md"
}
scalar_functions_new = {
  :name => "DataFusion Scalar Functions (NEW)",
  :url => "https://raw.githubusercontent.com/apache/datafusion/main/docs/source/user-guide/sql/scalar_functions_new.md"
}
agg_functions = {
  :name => "DataFusion Aggregate Functions",
  :url => "https://raw.githubusercontent.com/apache/datafusion/main/docs/source/user-guide/sql/aggregate_functions.md"
}
window_functions = {
  :name => "DataFusion Window Functions",
  :url => "https://raw.githubusercontent.com/apache/datafusion/main/docs/source/user-guide/sql/window_functions.md"
}

## Apache DataFusion functions
datafusion_functions = [scalar_functions, scalar_functions_new, agg_functions, window_functions]


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
  ## Fix link: #a_b_c -> #a-b-c
  # line.gsub!(/(#[a-zA-Z0-9_]+)\)/) { |match| match.gsub("_", "-") }
  ## Fix link: a_b_c.md -> #a-b-c
  line.gsub!(/\]\(([a-zA-Z0-9_]+\.md)\)/) { |match|
    match.gsub("_", "-").gsub(".md", "").gsub("](", "](#")
  }

  line
end


File.open("temp.md", "w") do |f|
  f.puts <<EOF
---
keywords: [DataFusion functions, scalar functions, window functions, array functions]
description: Generated from the Apache DataFusion project's documents, this page lists and describes DataFusion functions, including scalar, window, and array functions.
---
EOF

  f.puts("# DataFusion Functions\n\n")
  f.puts("This page is generated from the Apache DataFusion project's documents:")

  for doc in datafusion_functions
    name = doc[:name]
    url = doc[:url]
    markdown = "  * [#{name}](#{url})"
    f.puts markdown
  end

  f.puts

  for doc in datafusion_functions
    uri = URI(doc[:url])
    markdown = Net::HTTP.get(uri).force_encoding(Encoding::UTF_8)

    lines = markdown.split(/\n/)

    lines.map! do |line|
      line = process_headlines(line)
      line = fix_links(line)
      line
    end

    f.puts lines.join("\n")
  end
end

File.rename "temp.md", "./docs/reference/sql/functions/df-functions.md"

puts "docs/reference/sql/functions/df-functions.md updated!"
