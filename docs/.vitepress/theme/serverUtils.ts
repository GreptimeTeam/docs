import globby from 'globby'
import matter from 'gray-matter'
import md5 from 'md5'
import fs from 'fs-extra'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt()
const { spawn } = require('cross-spawn')
const dayjs = require('dayjs')
const gitDateExtractor = require('git-date-extractor')

export async function getBlogs() {
	let paths = await getPostMDFilePaths()
	let posts = await Promise.all(
		paths.map(async (item) => {
			const gitInfo = await getGitTimestamp(item)
			const file = await fs.readFile(item, 'utf-8')
			const { data, content } = matter(file)
			const article = md.render(content)
			return {
				...data,
				...gitInfo,
				title: data.title || article.match(/<h1>(.*?)<\/h1>/)?.[1],
				summary: data.summary || article.match(/<p>(.*?)<\/p>/)?.[1],
				regularPath: getRegularPath(item),
				cover: data.cover || '/blogs/art_img1.png',
			}
		})
	)
	posts.sort(_compareDate)
	return posts
}

function getRegularPath(str) {
	let temp = str.split('blogs')
	let res = `/blogs${temp[temp.length - 1]}`
	return res.replace('.md', '.html')
}

function _compareDate(obj1, obj2) {
	return obj1.date < obj2.date ? 1 : -1
}

async function getPostMDFilePaths() {
	let paths = await globby(['docs/blogs/**.md'], {
		ignore: ['docs/blogs/index.md', 'README.md'],
	})
	return paths
}

function getGitTimestamp(file) {
	return new Promise((resolve, reject) => {
		const child = spawn('git', ['log', '-1', '--pretty="%ci,%ce,%cn"', file])
		let output = ''
		child.stdout.on('data', (d) => (output += String(d)))
		child.on('close', () => {
			let [modify, email, author] = output.slice(1, -2).split(',')
			const avatar = email ? `https://www.gravatar.com/avatar/${md5(email)}` : '/blogs/avatar.png'
			modify = dayjs(modify).format('MMMM DD , YYYY')
			author = author || 'Greptime'
			resolve({
				modify,
				email,
				avatar,
				author,
			})
		})
		child.on('error', reject)
	})
}

export async function getPostLength() {
	// getPostMDFilePath return type is object not array
	return [...(await getPostMDFilePaths())].length
}
