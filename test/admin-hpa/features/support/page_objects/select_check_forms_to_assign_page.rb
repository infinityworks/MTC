class SelectFormToAssignPage < SitePrism::Page

  element :heading, '.heading-xlarge'
  element :assign_forms_to_text, ".panel div", text: 'Assign forms to '
  element :check_period, ".panel div:last-of-type"
  section :sticky_banner, StickyBannerSection, '.sticky-banner-wrapper'

  section :check_forms, '#assignFormToWindowList tbody' do
    sections :rows, 'tr' do
      element :name_of_form, 'td:first-of-type'
      element :select, '.multiple-choice-mtc'
    end
  end

end
