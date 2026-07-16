import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { PageHeader } from '@/components/forms/PageHeader';
import { TenantRequired } from '@/components/forms/TenantRequired';
import { useCreateSponsor, useSponsor, useUpdateSponsor } from '@/hooks/useSponsors';

export default function SponsorFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const sponsorQuery = useSponsor(id);
  const createMutation = useCreateSponsor();
  const updateMutation = useUpdateSponsor();

  const [name, setName] = useState('');
  const [supportedUrl, setSupportedUrl] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sponsorType, setSponsorType] = useState('Gold');

  useEffect(() => {
    if (sponsorQuery.data) {
      setName(sponsorQuery.data.name);
      setSupportedUrl(sponsorQuery.data.supported_url ?? '');
      setExtraInfo(sponsorQuery.data.extra_info ?? '');
      setImageUrl(sponsorQuery.data.image ?? '');
      setSponsorType(sponsorQuery.data.sponsor_type);
    }
  }, [sponsorQuery.data]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      name: name.trim(),
      supported_url: supportedUrl || null,
      extra_info: extraInfo || null,
      image: imageUrl || null,
      sponsor_type: sponsorType,
    };
    if (isEdit && id) {
      updateMutation.mutate({ id, payload }, { onSuccess: () => navigate('/dashboard/sponsors') });
      return;
    }
    createMutation.mutate(payload, { onSuccess: () => navigate('/dashboard/sponsors') });
  };

  const pending = createMutation.isPending || updateMutation.isPending;

  return (
    <TenantRequired>
      <div className="space-y-6">
        <PageHeader title={isEdit ? 'Edit sponsor' : 'Create sponsor'} backTo="/dashboard/sponsors" />
        {isEdit && sponsorQuery.isLoading ? (
          <LoadingSpinner className="h-8 w-8 text-[#12233D]" />
        ) : (
          <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border bg-white p-6">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Website URL" value={supportedUrl} onChange={(e) => setSupportedUrl(e.target.value)} />
            <Input label="Image URL" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
            <Input label="Extra info" value={extraInfo} onChange={(e) => setExtraInfo(e.target.value)} />
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#12233D]">Sponsor type</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={sponsorType}
                onChange={(e) => setSponsorType(e.target.value)}
              >
                {['Gold', 'Silver', 'Bronze', 'Partner'].map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create sponsor'}
            </Button>
          </form>
        )}
      </div>
    </TenantRequired>
  );
}
