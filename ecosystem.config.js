module.exports = {
	apps: [
		{
			name: 'software_logistica',
			script: 'server.js',
			cwd: '/root/software_logistica',
			watch: true,
			env: {
				NODE_ENV: 'producction',
				PORT: 3000
			}
		}
	]
}
