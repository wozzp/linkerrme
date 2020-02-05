'use strict'

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */

const Page = use('App/Models/Page')
const Template = use('App/Models/Template')

const { generatePageSlug } = use('App/Helpers/Page')

const PageTransformer = use('App/Transformers/Admin/PageTransformer')

/**
 * Resourceful controller for interacting with pages
 */
class PageController {
    /**
     * Show a list of all pages.
     * GET pages
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async index({ request, response, auth, paginate, transform, antl }) {
        try {
            const title = request.input('title')
            const user = await auth.getUser()

            const pageQuery = Page.query().where('user_id', user.id)

            if (title) {
                pageQuery.where('title', 'LIKE', `%${title}%`)
            }

            const pagesRaw = await pageQuery
                .orderBy('id', 'desc')
                .paginate(paginate.page, paginate.limit)

            const pages = await transform.paginate(pagesRaw, PageTransformer)

            return response.send({
                success: true,
                pages
            })
        } catch (error) {
            return response.status(500).send({
                success: false,
                error: antl.formatMessage('page.cant_list_pages')
            })
        }
    }

    /**
     * Create/save a new page.
     * POST pages
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async store({ request, response, auth, transform, antl }) {
        try {
            const name = request.input('name')
            const slug = await generatePageSlug(name)

            const user = await auth.getUser()

            const pageRaw = await Page.create({
                name,
                slug,
                template_id: 1,
                user_id: user.id
            })

            const page = await transform.item(pageRaw, PageTransformer)

            return response.status(201).send({
                success: true,
                page
            })
        } catch (error) {
            return response.status(500).send({
                success: false,
                error: antl.formatMessage('page.cant_create_page')
            })
        }
    }

    /**
     * Display a single page.
     * GET pages/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     * @param {View} ctx.view
     */
    async show({ params, request, response, view }) {}

    /**
     * Update page details.
     * PUT or PATCH pages/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async update({ params: { id }, request, response, auth, transform, antl }) {
        const page = await Page.findOrFail(id)
        const { name, slug, template_id } = request.only([
            'name',
            'slug',
            'template_id'
        ])

        try {
            const safe_slug = await generatePageSlug(slug, id)

            page.merge({
                name,
                slug: safe_slug,
                template_id
            })

            page.save()

            const updatedPage = await transform.item(page, PageTransformer)

            return response.status(200).send({
                success: true,
                updatedPage,
                message: antl.formatMessage('page.success_updated')
            })
        } catch (error) {
            return response.status(500).send({
                success: false,
                message: antl.formatMessage('page.fail_updated')
            })
        }
    }

    /**
     * Delete a page with id.
     * DELETE pages/:id
     *
     * @param {object} ctx
     * @param {Request} ctx.request
     * @param {Response} ctx.response
     */
    async destroy({ params, request, response }) {}
}

module.exports = PageController
