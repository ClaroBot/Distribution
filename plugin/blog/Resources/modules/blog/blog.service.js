let _blogData = new WeakMap()
let _url = new WeakMap()
let _$resource = new WeakMap()
let _Upload = new WeakMap()
let _uibDateParser = new WeakMap()
let _$q = new WeakMap()

export default class BlogService {
  
  constructor(blogData, url, $resource, Upload, uibDateParser, $q) {
    
    _blogData.set(this, blogData)
    _url.set(this, url)
    _$resource.set(this, $resource)
    _Upload.set(this, Upload)
    _uibDateParser.set(this, uibDateParser)
    _$q.set(this, $q)

    this.posts = []

    this.totalItems = null
    this.fixedTitle = null
    this.currentPost = null
    this.newPost = null
    this.currentPostDate = null
    this.tempInfo = this.info

    this.init()

  }

  get id() { return _blogData.get(this).id }
  get name() { return _blogData.get(this).name }
  get bannerImgStyle() { return _blogData.get(this).bannerImgStyle }
  get panels() { return _blogData.get(this).panels }
  set panels(panels) { return _blogData.get(this).panels = panels }
  get archives() { return _blogData.get(this).archives }
  get info() { return _blogData.get(this).info }
  set info(info) { _blogData.get(this).info = info }
  get isGrantedAdmin() { return _blogData.get(this).isGrantedAdmin }
  get isGrantedEdit() { return _blogData.get(this).isGrantedEdit }
  get isGrantedPost() { return _blogData.get(this).isGrantedPost }
  get authors() { return _blogData.get(this).authors }
  get rssUrl() { return _blogData.get(this).rssUrl }
  get options() { return _blogData.get(this).options }
  set options(options) { _blogData.get(this).options = options }
  get tags() { return _blogData.get(this).tags }
  set tags(tags) { return _blogData.get(this).tags = tags }
  get eventsPath() { return _blogData.get(this).eventsPath }
  get img_dir() { return _blogData.get(this).img_dir  }
  get banner_dir() { return _blogData.get(this).banner_dir  }
  get user() { return _blogData.get(this).user }
  get loginUrl() { return _blogData.get(this).loginUrl }

  init() {
    //this.getPosts();
  }

  getPosts(page = null) {
    const url = _url.get(this)('icap_blog_api_get_blog_post', {
      'blog': this.id,
      'page': page
    })

    let Posts = _$resource.get(this)(url)
    let posts = Posts.get(
      success => {
        this.posts = success.posts
        this.totalItems = success.total
      }
    )
    
    return posts.$promise
  }

  getPostsByTag(tag, page = null) {
    const url = _url.get(this)('icap_blog_api_get_blog_tags_posts', {
      'blog': this.id,
      'tagId': tag,
      'page': page
    })

    let Posts = _$resource.get(this)(url)
    let posts = Posts.get(
      success => {
        this.posts = success.posts
        this.totalItems = success.total
      }
    )

    return posts.$promise
  }

  getPostsByAuthor(author, page = null) {
    const url = _url.get(this)('icap_blog_api_get_blog_authors_posts', {
      'blog': this.id,
      'author': author,
      'page': page
    })

    let Posts = _$resource.get(this)(url)
    let posts = Posts.get(
      success => {
        this.posts = success.posts
        this.totalItems = success.total
      }
    )

    return posts.$promise
  }

  getPostsBySearch(terms, page = null) {
    const url = _url.get(this)('icap_blog_api_get_blog_search', {
      'blog': this.id,
      'search': terms,
      'page': page
    })

    let Posts = _$resource.get(this)(url)
    let posts = Posts.get(
      success => {
        this.posts = success.posts
        this.totalItems = success.total
      }
    )
    
    return posts.$promise
  }

  uploadBanner(file) {
    if (file === null) {
      return _$q.get(this).resolve()
    }

    const url = _url.get(this)('icap_blog_api_post_blog_banner', {
      'blog': this.id
    })
        
    return _Upload.get(this).upload({
      url: url,
      data: { file: file}
    })
    
  }

  removeBanner() {
    const url = _url.get(this)('icap_blog_api_delete_blog_banners', {
      'blog': this.id
    })
    let Banner = _$resource.get(this)(url, null, {
      'delete': { method: 'DELETE'}
    })
    let banner = new Banner()
    return banner.$delete(
      () => {
        this.banner_background_image = null
      }
    )
  }

  togglePostVisibility(post) {
    const url = _url.get(this)('icap_blog_api_put_blog_post_visibility', {
      'blog': this.id,
      'post': post.id
    })

    let Post = _$resource.get(this)(url, null, {
      'toggleVisibility': { method: 'PUT' }
    })

    let newPost = new Post(post)
    newPost.is_published = !post.is_published

    return newPost.$toggleVisibility(
      success => {
        post.is_published = success.is_published
      },
      failure => {
        post.is_published = failure.is_published
      }
    )
  }

  toggleCommentVisibility(comment, post) {
    const url = _url.get(this)('icap_blog_api_put_blog_post_comment_visibility', {
      'blog': this.id,
      'post': post.id,
      'comment': comment.id
    })

    let Comment = _$resource.get(this)(url, null, {
      'toggleVisibility': { method: 'PUT' }
    })

    let newComment = new Comment(post)
    newComment.is_published = !comment.is_published

    return newComment.$toggleVisibility(
      success => {
        comment.is_published = success.is_published
      },
      failure => {
        comment.is_published = failure.is_published
      }
    )
  }

  _fetchTags() {
    const url = _url.get(this)('icap_blog_api_get_blog_tags', {
      'blog': this.id
    })

    let Tags = _$resource.get(this)(url)
    Tags.query(
      success => {
        this.tags = success
      }
    )
  }
  
  createPost() {
    const url = _url.get(this)('icap_blog_api_post_blog_post', {
      'blog': this.id
    })

    let Post = _$resource.get(this)(url)
    let post = new Post(this.newPost)

    return post.$save(
      () => {
        // Update tags
        this._fetchTags()
      }
    )

  }
  
  deletePost(post, page) {

    const url = _url.get(this)('icap_blog_api_delete_blog_post', {
      'blog': this.id,
      'post': post.id
    })

    let Post = _$resource.get(this)(url)
    let postToDelete = new Post(post)
    return postToDelete.$delete(
      () => {
        // The post to delete is the last of the page, fetch the previous one
        if (this.posts.length === 1 && page > 2) {
          page--
        }

        this.getPosts(page)
      }
    )
  }

  setCurrentPost(post) {
    this.currentPost = post
    this.currentPostDate = new Date(post.publication_date)
    this.fixedTitle = post.title
  }

  setCurrentPostBySlug(slug) {
    const url = _url.get(this)('icap_blog_api_get_blog_post', {
      'blog': this.id,
      'postId': slug
    })

    let Post = _$resource.get(this)(url, null, {
      'get': { method: 'GET'}
    })
    let post = new Post()

    return post.$get(
      success => {
        this.setCurrentPost(success)
      }
    )
  }

  editOptions() {
    const url = _url.get(this)('icap_blog_api_put_blog_options', {
      'blog': this.id
    })

    let Options = _$resource.get(this)(url, null, {
      'edit': { method: 'PUT' }
    })

    let options = new Options(this.optionsCopy)

    return options.$edit(
      success => {
        this.panels = this.panelsCopy
        this.options = success
      }
    )
  }
  
  editInfo(info) {
    const url = _url.get(this)('icap_blog_api_put_blog', {
      'blog': this.id
    })

    let Blog = _$resource.get(this)(url, null, {
      'edit': { method: 'PUT' }
    })

    let blog = new Blog({info: info})

    return blog.$edit(
      success => {
        this.info = success.info
      }
    )
  }

  editPost() {
    const url = _url.get(this)('icap_blog_api_put_blog_post', {
      'blog': this.id,
      'post': this.currentPost.id
    })

    let Post = _$resource.get(this)(url, null, {
      'edit': { method: 'PUT' }
    })

    let post = new Post({
      'title': this.currentPost.title,
      'content': this.currentPost.content,
      'publication_date': this.currentPostDate,
      'tags': this.currentPost.tags
    })

    return post.$edit(
      success => {
        this.setCurrentPost(success)

        // Update tags
        this._fetchTags()
      }
    )
  }

  addComment(post, message) {
    const url = _url.get(this)('icap_blog_api_put_blog_post_comment', {
      'blog': this.id,
      'post': post.id
    })

    let Comment = _$resource.get(this)(url)

    let comment = new Comment({
      'message': message
    })

    return comment.$save(
      success => {
        post.comments.push(success)
      }
    )
  }

  editComment(post, comment) {
    const url = _url.get(this)('icap_blog_api_put_blog_post_comment', {
      'blog': this.id,
      'post': post.id,
      'comment': comment.id
    })
    
    let Comment = _$resource.get(this)(url, null, {
      'edit': { method: 'PUT' }
    })

    let updatedComment = new Comment(comment.tempData)

    return updatedComment.$edit(
      success => {
        comment.message = success.message
        comment.update_date = success.update_date
      }
    )

  }

}

BlogService.$inject = [
  'blog.data',
  'url',
  '$resource',
  'Upload',
  'uibDateParser',
  '$q'
]