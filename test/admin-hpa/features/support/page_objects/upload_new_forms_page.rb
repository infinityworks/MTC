class UploadNewFormsPage < SitePrism::Page
  set_url '/check-form/upload-new-forms'

  element :heading, '.heading-xlarge', text: 'Upload new form'
  element :download_form_example_template, '.numeric-list a[href="/csv/check-form-sample.csv"]'
  elements :new_form_info_message, '.numeric-list li'
  element :chose_file, '#csvFiles'
  element :live_check_form, "#checkFormType[value='L']"
  element :familiarisation_check_form, "#checkFormType[value='F']"
  elements :error_messages, '.error-summary-list li a'
  element :upload, 'input[value="Upload"]'
  elements :upload_area_error, '.error_message'

  element :cancel, 'a.button-secondary'
  element :confirm_overwrite, '#js-modal-confirmation-button'
  element :cancel_overwrite, '#js-modal-cancel-button'


  def create_unique_check_csv(file_name, file_contents)
    out_file = File.new(file_name, "w")
    out_file.puts(file_contents)
    out_file.close
  end

  def delete_csv_file(file_name)
    File.delete(file_name)
  end

  def submit_upload
    upload.click
    confirm_overwrite.click if confirm_overwrite.visible?
  end

end
