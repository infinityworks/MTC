class GroupPupilsPage < SitePrism::Page
  set_url '/group/pupils-list'

  element :heading, '.heading-xlarge', text: 'Group pupils'
  element :intro, '#lead-paragraph', text: 'Organise pupils into groups if you are not planning to administer the check to the whole cohort at the same time.'
  element :create_group, "a[href='/group/pupils-list/add']"
  element :related_heading, ".heading-medium", text: 'Related'
  element :guidance, "a", text: 'Guidance'
  element :pupil_register, "a[href='/pupil-register/pupils-list']", text: 'Pupil register'
  element :generate_pins, "a[href='/pupil-pin/generate-live-pins-overview']", text: 'Start the MTC - password and PINs'
  element :info_message, '.info-message'
  element :csrf, 'input[name="_csrf"]', visible: false

  section :group_list, '#groupList' do
    sections :rows, 'tbody tr' do
      element :group_name, 'strong a'
      element :group_count, 'span'
      element :highlight, '.highlight-item'
      element :remove, '.modal-link'
    end
  end

  section :modal, '.modal-box.show' do
    element :heading, '#modal-title'
    element :content, '.modal-content p'
    element :cancel, '.modal-cancel'
    element :confirm, '.modal-confirm'
  end

  def remove_all_groups
    (groups = group_list.rows.count
    groups.to_i.times do
      group_list.rows.first.remove.click
      modal.confirm.click
    end) unless has_no_group_list?
  end

  def remove_group(name)
    row = group_list.rows.find {|row| row.group_name.text == name}
    row.remove.click
    modal.confirm.click
  end

end
