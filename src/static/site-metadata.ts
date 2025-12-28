interface ISiteMetadataResult {
  siteTitle: string;
  siteUrl: string;
  description: string;
  logo: string;
  navLinks: {
    name: string;
    url: string;
  }[];
}

const getBasePath = () => {
  const baseUrl = import.meta.env.BASE_URL;
  return baseUrl === '/' ? '' : baseUrl;
};

const data: ISiteMetadataResult = {
  siteTitle: 'YYX Running Page',
  siteUrl: 'https://run.yyx235.top',
  logo: 'https://github.com/salt235.png',
  description: 'Personal site and blog',
  navLinks: [
    {
      name: '跑步总结',
      url: `${getBasePath()}/summary`,
    },
    {
      name: '个人博客',
      url: 'https://blog.yyx235.top',
    },
    {
      name: '关于我',
      url: 'https://github.com/salt235',
    },
  ],
};

export default data;
