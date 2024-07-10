#!/usr/bin/ruby
## A script to update functions in nightly references
## Usage: ruby misc/update_functions.rb [nightly | v0.x]
# encoding: utf-8
require 'net/http'
require 'rdoc'

scalar_functions = {
  :name => "DataFusion Scalar Functions",
  :url => "https://raw.githubusercontent.com/apache/datafusion/main/docs/source/user-guide/sql/scalar_functions.md"
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
datafusion_functions = [scalar_functions, agg_functions, window_functions]


File.open("temp.md", "w") do |f|
  f.puts("# DataFusion Functions")
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
      ## Add a level of headlines
      if line =~ /^\s*(#+)\s/
        replacement = "#{$1}#"

        if replacement.length >= 4
          replacement += "#"
        end
        line.gsub! $1, replacement
      end
      ## Fix link: #a_b_c -> #a-b-c
      if line =~ /(#[a-zA-Z0-9_]+)\)/
        link = $1.to_s
        replacement = link.gsub("_", "-")
        line.gsub! link, replacement
      end
      ## Fix link: a_b_c.md -> #a-b-c
      if line =~ /\]\(([a-zA-Z0-9_]+\.md)\)/
        link = $1.to_s
        replacement = "#" + link.gsub("_", "-").gsub("\.md", "")
        line.gsub! link, replacement
      end

      line
    end

    f.puts lines.join("\n")
  end
end

target = ARGV[0] || "nightly"

File.rename "temp.md", "#{target}/en/reference/sql/df_functions.md"

puts "#{target}/en/reference/sql/df_functions.md updated!"
