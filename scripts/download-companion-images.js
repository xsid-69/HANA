import https from 'https'
import http from 'http'
import fs from 'fs'
import path from 'path'

const IMAGES = {
  'sakshi-1.jpg': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=800&fit=crop&crop=face',
  'sakshi-2.jpg': 'https://images.unsplash.com/photo-1589571894960-20bbe2828d0a?w=600&h=800&fit=crop&crop=face',
  'rutuja-1.jpg': 'https://images.unsplash.com/photo-1611432579699-484f7990b127?w=600&h=800&fit=crop&crop=face',
  'rutuja-2.jpg': 'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=600&h=800&fit=crop&crop=face',
  'tanvi-1.jpg': 'https://images.unsplash.com/photo-1618151313441-bc79b11e5090?w=600&h=800&fit=crop&crop=face',
  'tanvi-2.jpg': 'https://images.unsplash.com/photo-1604004555489-723a93d6ce74?w=600&h=800&fit=crop&crop=face',
  'gauri-1.jpg': 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&h=800&fit=crop&crop=face',
  'gauri-2.jpg': 'https://images.unsplash.com/photo-1610216705422-caa3fcb6d158?w=600&h=800&fit=crop&crop=face',
  'shruti-1.jpg': 'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=600&h=800&fit=crop&crop=face',
  'shruti-2.jpg': 'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=600&h=800&fit=crop&crop=face',
  'sayuri-1.jpg': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&crop=face',
  'sayuri-2.jpg': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=800&fit=crop&crop=face',
  'vaishnavi-1.jpg': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&crop=face',
  'vaishnavi-2.jpg': 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&h=800&fit=crop&crop=face',
  'nikita-1.jpg': 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&h=800&fit=crop&crop=face',
  'nikita-2.jpg': 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&h=800&fit=crop&crop=face',
  'aditi-1.jpg': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=800&fit=crop&crop=face',
  'aditi-2.jpg': 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&h=800&fit=crop&crop=face',
  'palak-1.jpg': 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&h=800&fit=crop&crop=face',
  'palak-2.jpg': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&crop=face',
}

const outDir = path.join(process.cwd(), 'public', 'companions')

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const get = url.startsWith('https') ? https.get : http.get
    get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        // Follow redirect
        download(response.headers.location, dest).then(resolve).catch(reject)
        return
      }
      if (response.statusCode !== 200) {
        reject(new Error(`Failed ${dest}: HTTP ${response.statusCode}`))
        return
      }
      response.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', reject)
  })
}

async function main() {
  const entries = Object.entries(IMAGES)
  for (const [filename, url] of entries) {
    const dest = path.join(outDir, filename)
    if (fs.existsSync(dest)) {
      console.log(`  ⏭ ${filename} (already exists)`)
      continue
    }
    try {
      await download(url, dest)
      console.log(`  ✓ ${filename}`)
    } catch (err) {
      console.error(`  ✗ ${filename}: ${err.message}`)
    }
  }
  console.log('\nDone!')
}

main()
